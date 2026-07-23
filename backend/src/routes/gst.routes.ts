import { Router } from 'express';
import { GstController } from '../controllers/gst.controller';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
// requireRole removed

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Get overall dashboard metrics for GST
router.get('/dashboard', GstController.getDashboard);

// List all GST returns across clients
router.get('/returns', GstController.getReturns);
router.post('/returns', GstController.createReturn);

// Auto-parse a GST PDF Return
router.post('/parse-return', upload.single('document'), GstController.uploadReturn);

// List all GST challans across clients
router.get('/challans', GstController.getChallans);

// List all GST notices across clients
router.get('/notices', GstController.getNotices);

export default router;
