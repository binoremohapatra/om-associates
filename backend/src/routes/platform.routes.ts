import { Router } from 'express';
import { PlatformController } from '../controllers/platform.controller';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/request';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

// Public contact route
router.post('/contact', validate(contactSchema), PlatformController.submitContact);

// Protected routes
router.use(authenticate);

router.get('/news', PlatformController.getGstNews);
router.get('/notifications', PlatformController.getNotifications);
router.patch('/notifications/:id/read', PlatformController.markNotificationRead);

// Admin / Owner only
router.get('/contact', requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT), PlatformController.getContactMessages);

export default router;
