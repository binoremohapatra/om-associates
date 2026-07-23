import { Router } from 'express';
import { IncomeTaxController } from '../controllers/incometax.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/analytics', IncomeTaxController.getAnalytics);
router.get('/filings', IncomeTaxController.getFilings);
router.get('/deductions', IncomeTaxController.getDeductions);

export default router;
