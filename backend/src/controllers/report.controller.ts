import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { sendSuccess } from '../utils/helpers';

export class ReportController {
  static async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const fy = req.query.financialYear as string | undefined;
      const data = await ReportService.getMonthlyRevenue(req.organizationId!, fy);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async getTaxLiability(req: Request, res: Response, next: NextFunction) {
    try {
      const fy = req.query.financialYear as string | undefined;
      const data = await ReportService.getTaxLiabilityBreakdown(req.organizationId!, fy);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
}
