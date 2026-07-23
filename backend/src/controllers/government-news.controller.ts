import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as GovNewsService from '../services/government-news.service';
import { getSyncStatus, runNewsSync } from '../jobs/news-sync.job';

export class GovernmentNewsController {

  // GET /api/v1/news
  static async getNews(req: Request, res: Response) {
    try {
      const { department, category, search, page, limit, tags, sort } = req.query;
      const result = await GovNewsService.getNews({
        department: department as string,
        category: category as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: Math.min(limit ? parseInt(limit as string) : 20, 100),
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
        sort: (sort as any) || 'newest',
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      logger.error(`[GovNews] getNews error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch government news' });
    }
  }

  // GET /api/v1/news/latest
  static async getLatest(req: Request, res: Response) {
    try {
      const perDept = parseInt(req.query.perDept as string) || 5;
      const result = await GovNewsService.getLatestNews(perDept);
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error(`[GovNews] getLatest error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch latest news' });
    }
  }

  // GET /api/v1/news/stats
  static async getStats(req: Request, res: Response) {
    try {
      const result = await GovNewsService.getStats();
      res.json({ success: true, data: result });
    } catch (err: any) {
      logger.error(`[GovNews] getStats error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
  }

  // GET /api/v1/news/dashboard
  static async getDashboard(req: Request, res: Response) {
    try {
      const result = await GovNewsService.getDashboardWidgets();
      const syncStatus = getSyncStatus();
      res.json({ success: true, data: { ...result, syncStatus } });
    } catch (err: any) {
      logger.error(`[GovNews] getDashboard error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
    }
  }

  // GET /api/v1/news/category/:category
  static async getByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const { page, limit } = req.query;
      const result = await GovNewsService.getNews({
        category: category as string,
        page: page ? parseInt(page as string) : 1,
        limit: Math.min(limit ? parseInt(limit as string) : 20, 100),
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      logger.error(`[GovNews] getByCategory error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch news by category' });
    }
  }

  // GET /api/v1/news/source/:source
  static async getBySource(req: Request, res: Response) {
    try {
      const { source } = req.params;
      const { page, limit } = req.query;
      const result = await GovNewsService.getNews({
        department: source as string,
        page: page ? parseInt(page as string) : 1,
        limit: Math.min(limit ? parseInt(limit as string) : 20, 100),
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      logger.error(`[GovNews] getBySource error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch news by source' });
    }
  }

  // GET /api/v1/news/search?q=...
  static async search(req: Request, res: Response) {
    try {
      const { q, department, category, page, limit } = req.query;
      if (!q) return res.status(400).json({ success: false, error: 'Query parameter q is required' });
      const result = await GovNewsService.getNews({
        search: q as string,
        department: department as string,
        category: category as string,
        page: page ? parseInt(page as string) : 1,
        limit: Math.min(limit ? parseInt(limit as string) : 20, 50),
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      logger.error(`[GovNews] search error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Search failed' });
    }
  }

  // GET /api/v1/news/:id
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await GovNewsService.getNewsById(id as string);
      if (!item) return res.status(404).json({ success: false, error: 'News item not found' });
      res.json({ success: true, data: item });
    } catch (err: any) {
      logger.error(`[GovNews] getById error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch news item' });
    }
  }

  // POST /api/v1/news/bookmark
  static async addBookmark(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { newsId } = req.body;
      if (!newsId) return res.status(400).json({ success: false, error: 'newsId required' });
      const bookmark = await GovNewsService.addBookmark(userId, newsId);
      res.status(201).json({ success: true, data: bookmark });
    } catch (err: any) {
      logger.error(`[GovNews] addBookmark error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to add bookmark' });
    }
  }

  // DELETE /api/v1/news/bookmark/:newsId
  static async removeBookmark(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { newsId } = req.params;
      await GovNewsService.removeBookmark(userId, newsId as string);
      res.json({ success: true });
    } catch (err: any) {
      logger.error(`[GovNews] removeBookmark error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to remove bookmark' });
    }
  }

  // GET /api/v1/news/bookmarks
  static async getBookmarks(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const bookmarks = await GovNewsService.getBookmarks(userId);
      res.json({ success: true, data: bookmarks });
    } catch (err: any) {
      logger.error(`[GovNews] getBookmarks error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to fetch bookmarks' });
    }
  }

  // POST /api/v1/news/sync (manual trigger, admin only)
  static async triggerSync(req: Request, res: Response) {
    try {
      const status = getSyncStatus();
      if (status.running) {
        return res.json({ success: true, message: 'Sync already running', data: status });
      }
      // Fire and forget
      runNewsSync().catch(err => logger.error(`[GovNews] Manual sync error: ${err.message}`));
      res.json({ success: true, message: 'Sync triggered', data: getSyncStatus() });
    } catch (err: any) {
      logger.error(`[GovNews] triggerSync error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to trigger sync' });
    }
  }

  // GET /api/v1/news/sync/status
  static async getSyncStatus(req: Request, res: Response) {
    try {
      res.json({ success: true, data: getSyncStatus() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to get sync status' });
    }
  }
}

