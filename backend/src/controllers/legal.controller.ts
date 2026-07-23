import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class LegalController {
  // Get Legal Cases
  static async getCases(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;

      const clients = await prisma.client.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const cases = await prisma.legalCase.findMany({
        where: { clientId: { in: clientIds } },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: cases });
    } catch (error: any) {
      logger.error(`Get Legal Cases Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch legal cases' });
    }
  }

  // Create Legal Case
  static async createCase(req: Request, res: Response) {
    try {
      const { clientId, caseNumber, title, description, court, status, nextHearingDate } = req.body;

      const legalCase = await prisma.legalCase.create({
        data: {
          clientId,
          caseNumber,
          title,
          description,
          court,
          status: status || 'OPEN',
          nextHearingDate: nextHearingDate ? new Date(nextHearingDate) : null
        },
        include: { client: { select: { name: true } } }
      });

      res.status(201).json({ success: true, data: legalCase });
    } catch (error: any) {
      logger.error(`Create Legal Case Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to create legal case' });
    }
  }
}
