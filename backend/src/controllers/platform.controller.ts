import { Request, Response, NextFunction } from 'express';
import { PlatformService } from '../services/platform.service';
import { sendSuccess, sendCreated } from '../utils/helpers';
import { z } from 'zod';

export class PlatformController {
  static async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await PlatformService.submitContactForm(req.body);
      sendCreated(res, { message });
    } catch (err) {
      next(err);
    }
  }

  static async getContactMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await PlatformService.getContactMessages();
      sendSuccess(res, { messages });
    } catch (err) {
      next(err);
    }
  }

  static async getGstNews(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user?.organizationId;
      const news = await PlatformService.getGstNews(orgId);
      sendSuccess(res, { news });
    } catch (err) {
      next(err);
    }
  }

  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await PlatformService.getNotifications(req.user!.id);
      sendSuccess(res, { notifications });
    } catch (err) {
      next(err);
    }
  }

  static async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await PlatformService.markNotificationRead(id, req.user!.id);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }
}
