import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/request';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

const updateProfileSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole),
});

// Profile management
router.patch('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.get('/dashboard', UserController.getDashboardAnalytics);

// Organization Management (Owner / Admin)
router.get('/organization/users', requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT), UserController.getOrganizationUsers);
router.patch('/organization/role', requireRoles(UserRole.OWNER), validate(updateRoleSchema), UserController.updateRole);

export default router;
