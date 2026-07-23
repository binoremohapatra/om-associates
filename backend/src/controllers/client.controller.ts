import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service';
import { sendSuccess, sendCreated, sendNoContent, parsePagination, buildPaginationMeta } from '../utils/helpers';

export class ClientController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.createClient(req.organizationId!, req.body);
      sendCreated(res, client);
    } catch (err) {
      next(err);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.getClientDetails((req.params.id as string), req.organizationId!);
      sendSuccess(res, client);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = parsePagination(req.query as any);
      const search = req.query.search as string | undefined;

      const { items, total } = await ClientService.listClients(req.organizationId!, { page, limit, search });
      sendSuccess(res, items, 200, buildPaginationMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ClientService.updateClient((req.params.id as string), req.organizationId!, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await ClientService.deleteClient((req.params.id as string), req.organizationId!);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  }
}
