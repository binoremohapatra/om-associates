import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/helpers';
import { z } from 'zod';
import { BadRequestError } from '../types/errors';

export class UserController {
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, avatarUrl } = req.body;
      const user = await UserService.updateProfile(req.user!.id, { name, avatarUrl });
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  }

  static async getOrganizationUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.listOrganizationUsers(req.user!.organizationId);
      sendSuccess(res, { users });
    } catch (err) {
      next(err);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.body;
      if (!userId || !role) throw new BadRequestError('User ID and Role are required');
      
      const updatedUser = await UserService.updateRole(req.user!.id, userId, role);
      sendSuccess(res, { user: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  static async getDashboardAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await UserService.getDashboardAnalytics(req.user!.organizationId);
      sendSuccess(res, { analytics });
    } catch (err) {
      next(err);
    }
  }
}
