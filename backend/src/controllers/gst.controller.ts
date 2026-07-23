import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { GstParserService } from '../services/gst-parser.service';
import { BadRequestError } from '../types/errors';

export class GstController {
  // Get overall GST dashboard metrics
  static async getDashboard(req: Request, res: Response) {
    try {
      // organizationId is attached by authenticate middleware
      const orgId = req.user!.organizationId;

      const clients = await prisma.client.findMany({
        where: { organizationId: orgId, isActive: true },
        select: { id: true, name: true, gstin: true }
      });
      const clientIds = clients.map(c => c.id);

      // Concurrent queries for dashboard stats
      const [filings, challans, notices, profiles] = await Promise.all([
        prisma.gstFiling.findMany({ where: { clientId: { in: clientIds } } }),
        prisma.gstChallan.findMany({ where: { clientId: { in: clientIds } } }),
        prisma.gstNotice.findMany({ where: { clientId: { in: clientIds } } }),
        prisma.gstProfile.findMany({ where: { clientId: { in: clientIds } } })
      ]);

      const pendingFilingsList = filings.filter(f => f.status === 'PENDING');
      const pendingFilings = pendingFilingsList.length;
      const overdueFilings = filings.filter(f => f.status === 'OVERDUE').length;
      const unpaidChallans = challans.filter(c => c.status === 'PENDING').length;
      const openNotices = notices.filter(n => n.status === 'OPEN').length;

      // Group upcoming deadlines by formType
      const deadlinesMap: Record<string, { count: number, dueDate: Date }> = {};
      pendingFilingsList.forEach(f => {
        if (!deadlinesMap[f.formType]) {
          deadlinesMap[f.formType] = { count: 0, dueDate: f.dueDate };
        }
        deadlinesMap[f.formType].count++;
        if (f.dueDate < deadlinesMap[f.formType].dueDate) {
          deadlinesMap[f.formType].dueDate = f.dueDate;
        }
      });

      const upcomingDeadlines = Object.keys(deadlinesMap).map(formType => {
        const deadline = deadlinesMap[formType];
        const daysLeft = Math.ceil((deadline.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return {
          formType,
          dueDate: deadline.dueDate,
          daysLeft,
          clientsPending: deadline.count,
          urgency: daysLeft <= 1 ? 'critical' : daysLeft <= 5 ? 'warning' : 'normal'
        };
      }).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3);

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            pendingFilings,
            overdueFilings,
            unpaidChallans,
            openNotices,
            totalClients: clients.length
          },
          recentFilings: filings.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
          profiles,
          upcomingDeadlines
        }
      });
    } catch (error: any) {
      logger.error(`GST Dashboard Error: ${error.message}`);
      return res.status(500).json({ success: false, error: 'Failed to fetch GST dashboard data' });
    }
  }

  // Get list of GST Returns
  static async getReturns(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const filings = await prisma.gstFiling.findMany({
        where: { client: { organizationId: orgId } },
        include: { client: { select: { name: true, gstin: true } } },
        orderBy: { dueDate: 'desc' }
      });
      return res.status(200).json({ success: true, data: filings });
    } catch (error: any) {
      logger.error(`GST Returns Error: ${error.message}`);
      return res.status(500).json({ success: false, error: 'Failed to fetch GST returns' });
    }
  }

  // Get list of GST Challans
  static async getChallans(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const challans = await prisma.gstChallan.findMany({
        where: { client: { organizationId: orgId } },
        include: { client: { select: { name: true, gstin: true } } },
        orderBy: { generationDate: 'desc' }
      });
      return res.status(200).json({ success: true, data: challans });
    } catch (error: any) {
      logger.error(`GST Challans Error: ${error.message}`);
      return res.status(500).json({ success: false, error: 'Failed to fetch GST challans' });
    }
  }

  // Create a new GST Return Filing
  static async createReturn(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const { clientId, formType, periodStart, periodEnd, dueDate, status, totalTaxableValue, totalTaxPayable } = req.body;

      if (!clientId || !formType || !periodStart || !periodEnd || !dueDate) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Ensure client belongs to the org
      const client = await prisma.client.findFirst({
        where: { id: clientId, organizationId: orgId }
      });

      if (!client) {
        return res.status(403).json({ success: false, error: 'Client not found or unauthorized' });
      }

      const newFiling = await prisma.gstFiling.create({
        data: {
          clientId,
          createdById: req.user!.id,
          formType,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          dueDate: new Date(dueDate),
          status: status || 'PENDING',
          filedAt: status === 'FILED' ? new Date() : null,
          totalTaxableValue: totalTaxableValue ? BigInt(Math.floor(totalTaxableValue * 100)) : null,
          totalTaxPayable: totalTaxPayable ? BigInt(Math.floor(totalTaxPayable * 100)) : null,
          idempotencyKey: `gst-${clientId}-${formType}-${Date.now()}`
        }
      });

      // Need to serialize BigInt for JSON
      const serializedFiling = {
        ...newFiling,
        totalTaxableValue: newFiling.totalTaxableValue?.toString(),
        totalTaxPayable: newFiling.totalTaxPayable?.toString(),
        totalCgst: newFiling.totalCgst?.toString(),
        totalSgst: newFiling.totalSgst?.toString(),
        totalIgst: newFiling.totalIgst?.toString(),
      };

      return res.status(201).json({ success: true, data: serializedFiling });
    } catch (error: any) {
      logger.error(`GST Create Return Error: ${error.message}`);
      return res.status(500).json({ success: false, error: 'Failed to create GST return' });
    }
  }

  // Upload and Parse GST Return PDF
  static async uploadReturn(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('No PDF file uploaded');

      const parsedData = await GstParserService.parsePdf(req.file.buffer);
      if (!parsedData.gstin) {
        throw new BadRequestError('Could not find a valid GSTIN in the uploaded document.');
      }

      const orgId = req.user!.organizationId;

      // Find client by GSTIN (Assuming it's not encrypted like PAN for ease, if it is, we would encrypt it. We'll search raw first)
      let client = await prisma.client.findFirst({
        where: { organizationId: orgId, gstin: parsedData.gstin }
      });

      // If no client, auto create
      if (!client) {
        client = await prisma.client.create({
          data: {
            organizationId: orgId,
            name: `Unknown Client (${parsedData.gstin})`,
            gstin: parsedData.gstin,
            entityType: 'PROPRIETORSHIP'
          }
        });
      }

      // Default periods if extraction failed
      const periodStart = new Date();
      periodStart.setDate(1);
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0);
      const dueDate = new Date(periodEnd);
      dueDate.setDate(dueDate.getDate() + 20); // typical 20th of next month

      const formTypeStr = parsedData.formType === 'UNKNOWN' ? 'GSTR_3B' : parsedData.formType;

      const filing = await prisma.gstFiling.create({
        data: {
          clientId: client.id,
          createdById: req.user!.id,
          formType: formTypeStr as any,
          periodStart,
          periodEnd,
          dueDate,
          status: 'FILED',
          filedAt: new Date(),
          totalTaxableValue: BigInt(Math.floor(parsedData.totalTaxableValue * 100)),
          totalTaxPayable: BigInt(Math.floor(parsedData.totalTaxPayable * 100)),
          idempotencyKey: `gstr-${client.id}-${formTypeStr}-${Date.now()}`
        }
      });

      const serializedFiling = {
        ...filing,
        totalTaxableValue: filing.totalTaxableValue?.toString(),
        totalTaxPayable: filing.totalTaxPayable?.toString(),
        totalCgst: filing.totalCgst?.toString(),
        totalSgst: filing.totalSgst?.toString(),
        totalIgst: filing.totalIgst?.toString(),
      };

      res.status(201).json({ success: true, data: { filing: serializedFiling, parsedData } });
    } catch (err) {
      next(err);
    }
  }

  // Get list of GST Notices
  static async getNotices(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const notices = await prisma.gstNotice.findMany({
        where: { client: { organizationId: orgId } },
        include: { client: { select: { name: true, gstin: true } } },
        orderBy: { issueDate: 'desc' }
      });
      return res.status(200).json({ success: true, data: notices });
    } catch (error: any) {
      logger.error(`GST Notices Error: ${error.message}`);
      return res.status(500).json({ success: false, error: 'Failed to fetch GST notices' });
    }
  }
}
