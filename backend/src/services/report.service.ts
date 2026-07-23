import { prisma } from '../config/database';
import { getCurrentFinancialYear } from '../utils/helpers';

export class ReportService {
  /**
   * DB-level aggregation of revenue by month for a given FY.
   */
  static async getMonthlyRevenue(orgId: string, financialYear?: string) {
    const fy = financialYear || getCurrentFinancialYear();

    // Use Prisma aggregateRaw or GroupBy.
    // For simplicity with standard Prisma: we'll group by month using raw query or date extraction.
    // PostgreSQL specific date_trunc logic:
    const result = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "invoiceDate") as month,
        SUM("totalPaise") as revenue,
        SUM("totalTaxPaise") as tax
      FROM invoices
      WHERE "organizationId" = ${orgId} 
        AND "financialYear" = ${fy}
        AND "deletedAt" IS NULL
        AND "status" != 'CANCELLED'
      GROUP BY DATE_TRUNC('month', "invoiceDate")
      ORDER BY month ASC
    `;

    // Map DB output to frontend expected format
    const formatted = Array.isArray(result) ? result.map((row: any) => ({
      name: new Date(row.month).toLocaleString('default', { month: 'short' }),
      revenue: Number(row.revenue),
      tax: Number(row.tax),
    })) : [];

    return formatted;
  }

  static async getTaxLiabilityBreakdown(orgId: string, financialYear?: string) {
    const fy = financialYear || getCurrentFinancialYear();

    const result = await prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        financialYear: fy,
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
      _sum: {
        totalCgstPaise: true,
        totalSgstPaise: true,
        totalIgstPaise: true,
      },
    });

    const breakdown = [
      { name: 'CGST', value: Number(result._sum.totalCgstPaise ?? 0), color: '#38BDF8' },
      { name: 'SGST', value: Number(result._sum.totalSgstPaise ?? 0), color: '#818CF8' },
      { name: 'IGST', value: Number(result._sum.totalIgstPaise ?? 0), color: '#F472B6' },
    ];

    return breakdown;
  }
}
