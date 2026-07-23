import { Router } from 'express';
import { ImportExportController } from '../controllers/import-export.controller';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticate);

router.get('/records', ImportExportController.getRecords);
router.post('/records', ImportExportController.createRecord);
router.post('/parse-document', upload.single('eximPdf'), ImportExportController.uploadDocument);

export default router;
