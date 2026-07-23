import { Prisma, GstFormType } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError, IdempotencyError } from '../types/errors';
import { computeGst, computeGstLateFee, computeGstInterest, computeComplianceScore } from '../utils/taxEngine';
import type { GstCalculationInput } from '../types';

export class GstService {
  static calculateGst(input: GstCalculationInput) {
    return computeGst(input);
  }

  static async recordFiling(orgId: string, clientId: string, userId: string, data: any) {
    // Verify client belongs to org
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId: orgId },
    });
    if (!client) throw new NotFoundError('Client');

    // Idempotency check
    if (data.idempotencyKey) {
      const existing = await prisma.gstFiling.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) throw new IdempotencyError(existing);
    }

    const dueDate = new Date(data.dueDate);
    const filedAt = data.filedAt ? new Date(data.filedAt) : null;
    
    let lateFeeAccrued = 0n;
    if (filedAt) {
      lateFeeAccrued = computeGstLateFee(
        dueDate,
        filedAt,
        data.formType === 'GSTR_9' ? 10000n : 5000n, // ₹100/day for GSTR-9, else ₹50/day
        1000000n // Max ₹10k
      );

      // Add interest for GSTR-3B
      if (data.formType === 'GSTR_3B' && data.totalTaxPayable) {
        const interest = computeGstInterest(BigInt(data.totalTaxPayable), dueDate, filedAt, 0.18);
        lateFeeAccrued += interest;
      }
    }

    const payload: Prisma.GstFilingUncheckedCreateInput = {
      ...data,
      clientId,
      createdById: userId,
      lateFeeAccrued,
      status: filedAt ? 'FILED' : 'PENDING',
    };

    return prisma.gstFiling.create({ data: payload });
  }

  static async getClientComplianceScore(clientId: string, orgId: string) {
    const filings = await prisma.gstFiling.findMany({
      where: { clientId, client: { organizationId: orgId }, deletedAt: null },
      select: { dueDate: true, filedAt: true },
      orderBy: { dueDate: 'desc' },
      take: 12, // Look at last 12 filings for score
    });

    const score = computeComplianceScore(filings);
    return { score };
  }

  static async listFilings(orgId: string, clientId: string, query: { page: number; limit: number }) {
    const where = { clientId, client: { organizationId: orgId }, deletedAt: null };
    
    const [items, total] = await Promise.all([
      prisma.gstFiling.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { periodStart: 'desc' },
      }),
      prisma.gstFiling.count({ where }),
    ]);

    return { items, total };
  }
}
