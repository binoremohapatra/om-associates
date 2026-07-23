import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT, UserRole.STAFF, UserRole.CLIENT));

router.get('/dashboard', AnalyticsController.getDashboardData);

export default router;
