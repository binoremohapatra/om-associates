import { Router } from 'express';
import { GovernmentNewsController } from '../controllers/government-news.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ── Public routes (no auth required for reading news) ─────────────
router.get('/stats', GovernmentNewsController.getStats);
router.get('/dashboard', GovernmentNewsController.getDashboard);
router.get('/latest', GovernmentNewsController.getLatest);
router.get('/search', GovernmentNewsController.search);
router.get('/category/:category', GovernmentNewsController.getByCategory);
router.get('/source/:source', GovernmentNewsController.getBySource);
router.get('/', GovernmentNewsController.getNews);
router.get('/:id', GovernmentNewsController.getById);

// ── Authenticated routes ──────────────────────────────────────────
router.use(authenticate);
router.post('/bookmark', GovernmentNewsController.addBookmark);
router.delete('/bookmark/:newsId', GovernmentNewsController.removeBookmark);
router.get('/bookmarks/my', GovernmentNewsController.getBookmarks);
router.post('/sync', GovernmentNewsController.triggerSync);
router.get('/sync/status', GovernmentNewsController.getSyncStatus);

export default router;
