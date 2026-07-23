import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  source: string;
  url: string;
}

const SOURCES = [
  { url: 'https://www.gstcouncil.gov.in/central-gst', name: 'GST Council (CGST)' },
  { url: 'https://www.gstcouncil.gov.in/utgst', name: 'GST Council (UTGST)' },
  { url: 'https://www.incometax.gov.in/iec/foportal/help/how-to-file-itr1-form-sahaj', name: 'Income Tax (ITR-1)' }
];

export class NewsService {
  private static CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
  private static cachedNews: NewsItem[] | null = null;
  private static lastFetchTime = 0;

  static async fetchNews(): Promise<NewsItem[]> {
    const now = Date.now();
    if (this.cachedNews && (now - this.lastFetchTime < this.CACHE_DURATION_MS)) {
      return this.cachedNews;
    }

    const allNews: NewsItem[] = [];

    for (const source of SOURCES) {
      try {
        const response = await axios.get(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        
        // Generic extraction logic since govt sites vary widely
        // Attempt to find list items or rows that look like news/links
        const links = $('a[href]').filter(function() {
          const text = $(this).text().trim();
          const href = $(this).attr('href') || '';
          return text.length > 20 && !href.startsWith('#'); // Probably an article or document link if text is long enough
        }).slice(0, 5); // Limit to top 5 per source

        links.each((i, el) => {
          const text = $(el).text().trim();
          let href = $(el).attr('href') || '';
          
          if (href.startsWith('/')) {
            try {
              const urlObj = new URL(source.url);
              href = `${urlObj.origin}${href}`;
            } catch (e) {
              // ignore
            }
          }

          allNews.push({
            id: `${source.name}-${i}-${Date.now()}`,
            title: text.replace(/\s+/g, ' '),
            date: new Date().toISOString().split('T')[0], // Simulated date, actual date parsing requires precise DOM knowledge
            source: source.name,
            url: href,
          });
        });

      } catch (error: any) {
        logger.error(`Failed to scrape ${source.url}: ${error.message}`);
      }
    }

    // Sort or format if needed
    
    // Update cache
    this.cachedNews = allNews;
    this.lastFetchTime = Date.now();

    return allNews;
  }
}
