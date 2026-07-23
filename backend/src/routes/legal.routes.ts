import { Router } from 'express';
import { LegalController } from '../controllers/legal.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/cases', LegalController.getCases);
router.post('/cases', LegalController.createCase);

export default router;
