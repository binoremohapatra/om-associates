import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export class ClientRepository {
  static async create(data: Prisma.ClientUncheckedCreateInput) {
    return prisma.client.create({ data });
  }

  static async update(id: string, orgId: string, data: Prisma.ClientUncheckedUpdateInput) {
    return prisma.client.update({
      where: { id, organizationId: orgId, deletedAt: null },
      data,
    });
  }

  static async findById(id: string, orgId: string) {
    return prisma.client.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
  }

  static async findMany(orgId: string, params: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const where: Prisma.ClientWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { gstin: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    return { items, total };
  }

  static async softDelete(id: string, orgId: string) {
    return prisma.client.update({
      where: { id, organizationId: orgId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // Gets unpaid invoice total
  static async getOutstandingBalance(clientId: string): Promise<bigint> {
    const agg = await prisma.invoice.aggregate({
      where: { clientId, status: { in: ['SENT', 'OVERDUE'] }, deletedAt: null },
      _sum: { totalPaise: true, paidAmountPaise: true },
    });
    const total = BigInt(agg._sum.totalPaise ?? 0);
    const paid = BigInt(agg._sum.paidAmountPaise ?? 0);
    return total > paid ? total - paid : 0n;
  }
}
