import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../types/errors';

/**
 * Require the user to have one of the specified roles to access a route.
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role as UserRole)) {
        throw new ForbiddenError(`Role ${req.user.role} does not have permission to access this resource. Allowed roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
