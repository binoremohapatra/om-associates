import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { EximParserService } from '../services/exim-parser.service';
import { BadRequestError } from '../types/errors';
import { sendCreated } from '../utils/helpers';

export class ImportExportController {
  // Get EXIM Records
  static async getRecords(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;

      const clients = await prisma.client.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      const clientIds = clients.map(c => c.id);

      const records = await prisma.importExportRecord.findMany({
        where: { clientId: { in: clientIds } },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, data: records });
    } catch (error: any) {
      logger.error(`Get EXIM Records Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch EXIM records' });
    }
  }

  // Create EXIM Record
  static async createRecord(req: Request, res: Response) {
    try {
      const { clientId, recordType, documentNumber, portCode, status, filedAt } = req.body;

      const record = await prisma.importExportRecord.create({
        data: {
          clientId,
          recordType,
          documentNumber,
          portCode,
          status: status || 'PENDING',
          filedAt: filedAt ? new Date(filedAt) : null
        },
        include: { client: { select: { name: true } } }
      });

      res.status(201).json({ success: true, data: record });
    } catch (error: any) {
      logger.error(`Create EXIM Record Error: ${error.message}`);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Upload and Parse Document
  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('No PDF file uploaded');
      
      // We expect the client ID to be provided in the form data
      const clientId = req.body.clientId;
      if (!clientId) throw new BadRequestError('Client ID is required');

      const parsedData = await EximParserService.parsePdf(req.file.buffer);
      
      const record = await prisma.importExportRecord.create({
        data: {
          clientId,
          recordType: parsedData.recordType === 'UNKNOWN' ? 'IEC' : parsedData.recordType,
          documentNumber: parsedData.documentNumber,
          portCode: parsedData.portCode,
          status: 'PENDING'
        }
      });

      sendCreated(res, { record, parsedData });
    } catch (err) {
      next(err);
    }
  }
}
