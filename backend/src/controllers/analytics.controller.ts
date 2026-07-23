import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/helpers';

export class AnalyticsController {
  static async getDashboardData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getDashboardData(req.user!.organizationId);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
}
