import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../types/errors';
import type { AuthenticatedUser } from '../types';
import jwt from 'jsonwebtoken';
import { config } from '../config';

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

const ROLE_HIERARCHY: UserRole[] = [
  UserRole.CLIENT,
  UserRole.STAFF,
  UserRole.ACCOUNTANT,
  UserRole.OWNER,
];

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export const authenticate = [
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokenString = req.headers.authorization?.replace('Bearer ', '');

      if (!tokenString) {
        throw new UnauthorizedError('Unauthenticated');
      }

      let payload: any;
      try {
        payload = jwt.verify(tokenString, config.jwt.accessSecret);
      } catch (err) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      if (!payload.userId) {
        throw new UnauthorizedError('Invalid token payload');
      }

      // Check if session exists in database (optional but good for strict security / revocation)
      const session = await prisma.session.findUnique({
        where: { token: tokenString }
      });

      if (!session) {
        throw new UnauthorizedError('Session expired or revoked');
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!dbUser) {
        throw new UnauthorizedError('User not found');
      }

      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        organizationId: dbUser.organizationId,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
      } as AuthenticatedUser;
      
      req.organizationId = dbUser.organizationId;
      next();
    } catch (err) {
      next(err);
    }
  }
];

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError());

    const userLevel = getRoleLevel(req.user.role);
    const requiredLevel = Math.min(...roles.map(getRoleLevel));

    if (userLevel < requiredLevel) {
      return next(new ForbiddenError(`Requires one of: ${roles.join(', ')}`));
    }
    next();
  };
}

export const requireOwner = requireRole(UserRole.OWNER);
export const requireAccountant = requireRole(UserRole.ACCOUNTANT, UserRole.OWNER);
export const requireStaff = requireRole(UserRole.STAFF, UserRole.ACCOUNTANT, UserRole.OWNER);
