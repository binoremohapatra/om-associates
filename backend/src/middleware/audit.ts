import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuditAction } from '@prisma/client';

interface AuditOptions {
  action: AuditAction;
  entityType: string;
  getEntityId: (req: Request) => string;
  getBefore?: (req: Request) => Promise<unknown>;
  getAfter?: (req: Request, res: Response) => Promise<unknown>;
}

/**
 * Audit log middleware for financial mutations.
 * Records who changed what, when, and from what value.
 */
export function auditLog(opts: AuditOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const before = opts.getBefore ? await opts.getBefore(req) : undefined;

    // Intercept response to capture "after" state
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      // Fire-and-forget audit write (don't block response)
      setImmediate(async () => {
        try {
          const after = opts.getAfter ? await opts.getAfter(req, res) : body?.data;
          await prisma.auditLog.create({
            data: {
              actorId: req.user?.id,
              action: opts.action,
              entityType: opts.entityType,
              entityId: opts.getEntityId(req),
              before: before as object | undefined,
              after: after as object | undefined,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              requestId: req.requestId,
            },
          });
        } catch { /* silent — audit failure should not disrupt main flow */ }
      });
      return originalJson(body);
    };

    next();
  };
}
