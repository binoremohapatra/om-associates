import { Router } from 'express';
import { TaxController } from '../controllers/tax.controller';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/request';
import { z } from 'zod';
import { UserRole, TaxRegime } from '@prisma/client';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticate);

const createFilingSchema = z.object({
  clientId: z.string(),
  financialYear: z.string(),
  regime: z.nativeEnum(TaxRegime),
  grossIncome: z.number().min(0),
  deductions: z.number().min(0).optional(),
});

const addDeductionSchema = z.object({
  financialYear: z.string(),
  section: z.string(),
  description: z.string(),
  amountPaise: z.number().min(0),
});

// Rules
router.get('/rules', TaxController.getTaxRules);

// Filings
router.post('/filings', requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT), validate(createFilingSchema), TaxController.createTaxFiling);
router.post('/parse-itrv', requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT), upload.single('itrvPdf'), TaxController.uploadItrV);
router.get('/clients/:clientId/filings', requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT, UserRole.STAFF), TaxController.getTaxFilings);

// Deductions
router.post('/clients/:clientId/deductions', requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT), validate(addDeductionSchema), TaxController.addDeduction);
router.get('/clients/:clientId/deductions', requireRoles(UserRole.OWNER, UserRole.ACCOUNTANT, UserRole.STAFF), TaxController.getDeductions);

export default router;
