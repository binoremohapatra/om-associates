import { Prisma, InvoiceStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError, IdempotencyError, BadRequestError } from '../types/errors';
import { computeLineItemTotals } from '../utils/taxEngine';
import { getCurrentFinancialYear } from '../utils/helpers';

export class InvoiceService {
  static async createInvoice(orgId: string, clientId: string, userId: string, data: any) {
    // 1. Verify Client
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId: orgId },
    });
    if (!client) throw new NotFoundError('Client');

    // 2. Idempotency Check
    if (data.idempotencyKey) {
      const existing = await prisma.invoice.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
        include: { lineItems: true },
      });
      if (existing) throw new IdempotencyError(existing);
    }

    // 3. Generate Sequential Invoice Number using DB transaction
    const fy = getCurrentFinancialYear();
    
    return prisma.$transaction(async (tx: any) => {
      // Lock the sequence row for this org+FY
      const seq = await tx.invoiceSequence.upsert({
        where: {
          organizationId_financialYear: { organizationId: orgId, financialYear: fy },
        },
        update: { lastSequence: { increment: 1 } },
        create: { organizationId: orgId, financialYear: fy, lastSequence: 1 },
      });

      const invoiceNumber = `INV-${fy.replace('-', '')}-${String(seq.lastSequence).padStart(5, '0')}`;

      // 4. Compute Totals using TaxEngine
      let subtotal = 0n;
      let totalCgst = 0n;
      let totalSgst = 0n;
      let totalIgst = 0n;
      let totalTax = 0n;

      const lineItems = data.lineItems.map((item: any) => {
        const calcs = computeLineItemTotals(
          BigInt(item.unitPricePaise),
          item.quantity,
          item.gstRate,
          data.transactionType
        );

        subtotal += calcs.baseAmountPaise;
        totalCgst += calcs.cgstPaise;
        totalSgst += calcs.sgstPaise;
        totalIgst += calcs.igstPaise;
        totalTax += calcs.cgstPaise + calcs.sgstPaise + calcs.igstPaise;

        return {
          description: item.description,
          quantity: item.quantity,
          unitPricePaise: BigInt(item.unitPricePaise),
          gstRate: item.gstRate,
          transactionType: data.transactionType,
          cgstRate: calcs.cgstRate,
          sgstRate: calcs.sgstRate,
          igstRate: calcs.igstRate,
          cgstPaise: calcs.cgstPaise,
          sgstPaise: calcs.sgstPaise,
          igstPaise: calcs.igstPaise,
          totalPaise: calcs.totalPaise,
          hsn: item.hsn,
        };
      });

      const discount = BigInt(data.discountPaise ?? 0);
      const grandTotal = subtotal - discount + totalTax;

      if (grandTotal < 0n) throw new BadRequestError('Discount cannot exceed subtotal');

      // 5. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          organizationId: orgId,
          clientId,
          createdById: userId,
          invoiceNumber,
          financialYear: fy,
          invoiceDate: new Date(data.invoiceDate),
          dueDate: new Date(data.dueDate),
          subtotalPaise: subtotal,
          discountPaise: discount,
          totalCgstPaise: totalCgst,
          totalSgstPaise: totalSgst,
          totalIgstPaise: totalIgst,
          totalTaxPaise: totalTax,
          totalPaise: grandTotal,
          status: InvoiceStatus.DRAFT,
          notes: data.notes,
          termsConditions: data.termsConditions,
          idempotencyKey: data.idempotencyKey,
          lineItems: {
            create: lineItems,
          },
        },
        include: { lineItems: true },
      });

      return invoice;
    });
  }

  static async listInvoices(orgId: string, query: { page: number; limit: number; clientId?: string }) {
    const where: Prisma.InvoiceWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      ...(query.clientId ? { clientId: query.clientId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { client: { select: { name: true, gstin: true } } },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { items, total };
  }

  static async updateStatus(id: string, orgId: string, status: InvoiceStatus) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!invoice) throw new NotFoundError('Invoice');

    // Enforce basic state transitions
    if (invoice.status === 'CANCELLED') throw new BadRequestError('Cannot update cancelled invoice');
    if (invoice.status === 'PAID' && status !== 'CANCELLED') {
      throw new BadRequestError('Cannot change status of paid invoice');
    }

    const updates: Prisma.InvoiceUpdateInput = { status };
    if (status === 'SENT') updates.sentAt = new Date();
    if (status === 'PAID') {
      updates.paidAt = new Date();
      updates.paidAmountPaise = invoice.totalPaise;
    }
    if (status === 'CANCELLED') updates.cancelledAt = new Date();

    return prisma.invoice.update({
      where: { id },
      data: updates,
    });
  }
}
