import { fetchWithRetry, resolveUrl, cleanText, parseIndianDate, ScrapedItem } from './base.scraper';
import { logger } from '../utils/logger';

const BASE_URL = 'https://www.incometaxindia.gov.in';
const PORTAL_URL = 'https://www.incometax.gov.in';

const SOURCES = [
  {
    url: `${BASE_URL}/Pages/press-releases.aspx`,
    category: 'Press Release',
    label: 'CBDT Press Release',
  },
  {
    url: `${BASE_URL}/Pages/communications/notifications.aspx`,
    category: 'Notification',
    label: 'CBDT Notification',
  },
  {
    url: `${BASE_URL}/Pages/communications/circulars.aspx`,
    category: 'Circular',
    label: 'CBDT Circular',
  },
];

export async function scrapeIncomeTax(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  for (const src of SOURCES) {
    try {
      logger.info(`[IncomeTax] Scraping ${src.url}`);
      const $ = await fetchWithRetry(src.url);
      
      const selectors = [
        '.ms-rtestate-field ul li',
        'table.dxgvTable tbody tr',
        '.dx-item-content a',
        'ul.list-items li',
        'table tbody tr',
        '.layout-table tr',
        'a[href*=".pdf"]',
        'a[href*=".PDF"]',
      ];
      
      let found = false;
      for (const sel of selectors) {
        const els = $(sel);
        if (els.length > 1) {
          els.each((i, el) => {
            const $el = $(el);
            const linkEl = $el.is('a') ? $el : $el.find('a').first();
            const title = cleanText(linkEl.text() || $el.text());
            if (!title || title.length < 10 || title.length > 400) return;
            if (/click here|read more|download|view all/i.test(title)) return;
            
            let href = linkEl.attr('href') || '';
            href = resolveUrl(href, BASE_URL);
            
            let pdfUrl: string | undefined;
            if (href.toLowerCase().includes('.pdf')) pdfUrl = href;
            
            let publishedAt = new Date();
            const yearMatch = title.match(/\b(20[0-9]{2})\b/);
            if (yearMatch) publishedAt = new Date(parseInt(yearMatch[1]), new Date().getMonth(), 1);
            
            const cells = $el.find('td');
            if (cells.length >= 2) {
              const dateText = $(cells[0]).text() || $(cells[1]).text();
              const parsed = parseIndianDate(dateText);
              if (parsed) publishedAt = parsed;
            }
            
            const notifMatch = title.match(/(?:Notification|Circular|Instruction)\s*(?:No\.?\s*)?([0-9\/\-]+)/i);
            
            items.push({
              title,
              summary: title,
              category: src.category,
              notificationNo: notifMatch?.[1],
              officialUrl: href || src.url,
              pdfUrl,
              sourceWebsite: BASE_URL,
              tags: ['Income Tax', 'CBDT', src.label],
              priority: src.category === 'Notification' ? 'HIGH' : 'NORMAL',
              publishedAt,
              department: 'income-tax',
            });
          });
          if (items.length > 0) { found = true; break; }
        }
      }
      
      if (!found) {
        // Generic link harvest
        $('a').each((i, el) => {
          const title = cleanText($(el).text());
          const href = $(el).attr('href') || '';
          if (title.length < 15 || title.length > 350) return;
          if (/home|login|register|sitemap|search|skip|language/i.test(title)) return;
          const resolved = resolveUrl(href, BASE_URL);
          items.push({
            title,
            summary: title,
            category: src.category,
            officialUrl: resolved,
            pdfUrl: href.toLowerCase().includes('.pdf') ? resolved : undefined,
            sourceWebsite: BASE_URL,
            tags: ['Income Tax', 'CBDT'],
            priority: 'NORMAL',
            publishedAt: new Date(),
            department: 'income-tax',
          });
        });
      }
      
      logger.info(`[IncomeTax] ${src.label}: ${items.length} items total`);
    } catch (err: any) {
      logger.error(`[IncomeTax] Error scraping ${src.url}: ${err.message}`);
    }
  }
  
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.title.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 50);
}
