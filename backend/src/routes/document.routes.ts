import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure local multer as placeholder for S3/Cloudinary
const upload = multer({ dest: 'uploads/' });

// Apply auth middleware to all routes
router.use(authenticate);

// Get dashboard stats
router.get('/stats', DocumentController.getStats);

// List all documents (supports folder, category, search filters)
router.get('/', DocumentController.getDocuments);

// Upload document (single file for now)
router.post('/upload', upload.single('file'), DocumentController.uploadDocument);

// Star/Unstar document
router.patch('/:id/star', DocumentController.toggleStar);

// Trash document
router.delete('/:id', DocumentController.trashDocument);

// Restore document
router.patch('/:id/restore', DocumentController.restoreDocument);

export default router;
