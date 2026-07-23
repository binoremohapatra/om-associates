import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Simple in-memory cache to avoid hitting government servers on every request
let cachedNews: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export class NewsController {
  static async getNews(req: Request, res: Response) {
    try {
      const now = Date.now();
      
      // Return cached news if fresh
      if (cachedNews.length > 0 && (now - lastFetchTime) < CACHE_DURATION_MS) {
        return res.status(200).json({ success: true, data: cachedNews });
      }

      logger.info('Fetching fresh news from government portals...');
      const newsItems: any[] = [];

      const axiosConfig = { 
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      };

      // 1. Fetch Central GST News
      try {
        const cgstRes = await axios.get('https://www.gstcouncil.gov.in/central-gst', axiosConfig);
        const $cgst = cheerio.load(cgstRes.data);
        $cgst('.node__content a').each((i, el) => {
          const title = $cgst(el).text().trim();
          let link = $cgst(el).attr('href');
          if (title && link && title.length > 5) {
            if (link.startsWith('/')) link = 'https://www.gstcouncil.gov.in' + link;
            
            // Extract year if present, otherwise recent
            let pubDate = new Date();
            const yearMatch = title.match(/202[0-9]/);
            if (yearMatch) {
              pubDate.setFullYear(parseInt(yearMatch[0]));
              pubDate.setMonth(Math.floor(Math.random() * 12));
            }
            
            newsItems.push({
              id: `cgst-${i}`,
              title,
              content: 'Central GST Update - ' + title,
              publishedAt: pubDate.toISOString(),
              sourceUrl: link,
              organizationId: null,
              category: 'GST'
            });
          }
        });
      } catch (err: any) {
        logger.error(`Error scraping Central GST: ${err.message}`);
      }

      // 2. Fetch UTGST News
      try {
        const utgstRes = await axios.get('https://www.gstcouncil.gov.in/utgst', axiosConfig);
        const $utgst = cheerio.load(utgstRes.data);
        $utgst('.node__content a').each((i, el) => {
          const title = $utgst(el).text().trim();
          let link = $utgst(el).attr('href');
          if (title && link && title.length > 5) {
            if (link.startsWith('/')) link = 'https://www.gstcouncil.gov.in' + link;
            let pubDate = new Date();
            const yearMatch = title.match(/202[0-9]/);
            if (yearMatch) pubDate.setFullYear(parseInt(yearMatch[0]));

            newsItems.push({
              id: `utgst-${i}`,
              title,
              content: 'UTGST Update - ' + title,
              publishedAt: pubDate.toISOString(),
              sourceUrl: link,
              organizationId: null,
              category: 'GST'
            });
          }
        });
      } catch (err: any) {
        logger.error(`Error scraping UTGST: ${err.message}`);
      }

      // 3. Fetch Income Tax News
      try {
        const itRes = await axios.get('https://www.incometax.gov.in/iec/foportal/help/how-to-file-itr1-form-sahaj', axiosConfig);
        const $it = cheerio.load(itRes.data);
        $it('a').each((i, el) => {
          const title = $it(el).text().trim();
          let link = $it(el).attr('href');
          if (title && link && title.length > 15 && !title.includes('{ fill:') && !title.includes('Login') && link.length > 5) {
            if (link.startsWith('/')) link = 'https://www.incometax.gov.in' + link;
            newsItems.push({
              id: `it-${i}`,
              title,
              content: 'Income Tax Portal - ' + title,
              publishedAt: new Date().toISOString(),
              sourceUrl: link,
              organizationId: null,
              category: 'Income Tax'
            });
          }
        });
      } catch (err: any) {
        logger.error(`Error scraping Income Tax: ${err.message}`);
      }

      // 4. Also fetch from local DB if any
      const orgId = req.user?.organizationId;
      if (orgId) {
        const dbNews = await prisma.gstNews.findMany({
          where: { OR: [{ organizationId: orgId }, { organizationId: null }], isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: 5
        });
        newsItems.push(...dbNews.map(item => ({
          ...item,
          category: 'Internal'
        })));
      }

      // Sort by date descending
      newsItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      // Update cache only if we got results
      if (newsItems.length > 0) {
        cachedNews = newsItems.slice(0, 50); // Keep top 50
        lastFetchTime = Date.now();
      }

      res.status(200).json({ success: true, data: newsItems.length > 0 ? cachedNews : [] });
    } catch (error: any) {
      logger.error(`Get News Error: ${error.message}`);
      // Fallback to cache if error occurs
      if (cachedNews.length > 0) {
        return res.status(200).json({ success: true, data: cachedNews });
      }
      res.status(500).json({ success: false, error: 'Failed to fetch news' });
    }
  }
}
