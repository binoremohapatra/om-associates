import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class IncomeTaxController {
  // Get Income Tax Analytics
  static async getAnalytics(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;

      const clients = await prisma.client.findMany({
        where: { organizationId: orgId, isActive: true },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const [aggregate, pendingReturns, filedReturns] = await Promise.all([
        prisma.taxFiling.aggregate({
          where: { clientId: { in: clientIds } },
          _sum: { totalTaxPayable: true, advanceTaxPaid: true }
        }),
        prisma.taxFiling.count({
          where: { clientId: { in: clientIds }, status: 'PENDING' }
        }),
        prisma.taxFiling.count({
          where: { clientId: { in: clientIds }, status: 'FILED' }
        })
      ]);

      const analytics = {
        totalTaxLiability: Number(aggregate._sum.totalTaxPayable || 0),
        advanceTaxPaid: Number(aggregate._sum.advanceTaxPaid || 0),
        pendingReturns,
        filedReturns,
      };

      res.status(200).json({ success: true, data: analytics });
    } catch (error: any) {
      logger.error(`Get Income Tax Analytics Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  }

  // Get Tax Filings
  static async getFilings(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      
      const clients = await prisma.client.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const filings = await prisma.taxFiling.findMany({
        where: { clientId: { in: clientIds } },
        include: { client: { select: { name: true, pan: true } } },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: filings });
    } catch (error: any) {
      logger.error(`Get Tax Filings Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch tax filings' });
    }
  }

  // Get Deductions
  static async getDeductions(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;

      const clients = await prisma.client.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const deductions = await prisma.deduction.findMany({
        where: { clientId: { in: clientIds } },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: deductions });
    } catch (error: any) {
      logger.error(`Get Deductions Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch deductions' });
    }
  }
}
