import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { validate } from '../middleware/request';
import { authenticate, requireStaff } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { createClientSchema, updateClientSchema } from '../validators';
import { AuditAction } from '@prisma/client';
import { prisma } from '../config/database';

const router = Router();

// All client routes require authentication + at least STAFF role
router.use(authenticate, requireStaff);

router.post(
  '/',
  validate(createClientSchema),
  auditLog({
    action: AuditAction.CREATE,
    entityType: 'Client',
    getEntityId: (req) => (req.res as any)?.locals?.createdId || 'new', // Would typically extract from response
    getAfter: async (req, res) => res.locals.data,
  }),
  ClientController.create
);

router.get('/', ClientController.list);
router.get('/:id', ClientController.getOne);

router.patch(
  '/:id',
  validate(updateClientSchema),
  auditLog({
    action: AuditAction.UPDATE,
    entityType: 'Client',
    getEntityId: (req) => (req.params.id as string),
    getBefore: async (req) => prisma.client.findUnique({ where: { id: req.params.id as string } }),
    getAfter: async (req, res) => res.locals.data,
  }),
  ClientController.update
);

router.delete(
  '/:id',
  auditLog({
    action: AuditAction.DELETE,
    entityType: 'Client',
    getEntityId: (req) => (req.params.id as string),
    getBefore: async (req) => prisma.client.findUnique({ where: { id: req.params.id as string } }),
  }),
  ClientController.remove
);

export default router;
