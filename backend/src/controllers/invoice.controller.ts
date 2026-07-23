import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { sendSuccess, sendCreated, parsePagination, buildPaginationMeta } from '../utils/helpers';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.createInvoice(
        req.organizationId!,
        req.body.clientId,
        req.user!.id,
        req.body
      );
      
      res.locals.createdId = invoice.id;
      sendCreated(res, invoice);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as any);
      const clientId = req.query.clientId as string | undefined;

      const { items, total } = await InvoiceService.listInvoices(req.organizationId!, { page, limit, clientId });
      sendSuccess(res, items, 200, buildPaginationMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updated = await InvoiceService.updateStatus((req.params.id as string), req.organizationId!, status as InvoiceStatus);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }
}
