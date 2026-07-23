import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // Any authenticated user (including Clients for their own data eventually, though currently scoped to org)

router.get('/revenue', ReportController.getRevenue);
router.get('/tax-liability', ReportController.getTaxLiability);

export default router;
