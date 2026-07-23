import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { validate, extractIdempotencyKey } from '../middleware/request';
import { authenticate, requireStaff } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { createInvoiceSchema } from '../validators';
import { AuditAction } from '@prisma/client';
import { prisma } from '../config/database';

const router = Router();

router.use(authenticate, requireStaff);

router.post(
  '/',
  extractIdempotencyKey,
  validate(createInvoiceSchema),
  auditLog({
    action: AuditAction.CREATE,
    entityType: 'Invoice',
    getEntityId: (req) => (req.res as any)?.locals?.createdId || 'new',
    getAfter: async (req, res) => res.locals.data,
  }),
  InvoiceController.create
);

router.get('/', InvoiceController.list);

router.patch(
  '/:id/status',
  auditLog({
    action: AuditAction.UPDATE,
    entityType: 'Invoice',
    getEntityId: (req) => (req.params.id as string),
    getBefore: async (req) => prisma.invoice.findUnique({ where: { id: req.params.id as string } }),
    getAfter: async (req, res) => res.locals.data,
  }),
  InvoiceController.updateStatus
);

export default router;
