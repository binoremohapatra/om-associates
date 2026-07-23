import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../types/errors';
import type { JwtPayload, AuthenticatedUser } from '../types';

// Role hierarchy: higher index = higher privilege
const ROLE_HIERARCHY: UserRole[] = [
  UserRole.CLIENT,
  UserRole.STAFF,
  UserRole.ACCOUNTANT,
  UserRole.OWNER,
];

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Bearer token required'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
    if (payload.type !== 'access') {
      return next(new UnauthorizedError('Invalid token type'));
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.orgId,
      name: '',
      avatarUrl: null,
    } satisfies AuthenticatedUser;
    req.organizationId = payload.orgId;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired — please refresh'));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid token'));
    }
    next(err);
  }
}

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

// Convenience guards
export const requireOwner = requireRole(UserRole.OWNER);
export const requireAccountant = requireRole(UserRole.ACCOUNTANT, UserRole.OWNER);
export const requireStaff = requireRole(UserRole.STAFF, UserRole.ACCOUNTANT, UserRole.OWNER);
