import { fetchWithRetry, resolveUrl, cleanText, parseIndianDate, ScrapedItem } from './base.scraper';
import { logger } from '../utils/logger';

const BASE_URL = 'https://cbic-gst.gov.in';
const SOURCES = [
  { url: `${BASE_URL}/gst-circulars-instructions.html`, category: 'Circular', label: 'CBIC Circular' },
  { url: `${BASE_URL}/gst-notification-central-tax.html`, category: 'Notification', label: 'CBIC Central Tax' },
  { url: `${BASE_URL}/gst-notification-integrated-tax.html`, category: 'Notification', label: 'CBIC Integrated Tax' },
  { url: `${BASE_URL}/gst-goods-services-rates.html`, category: 'Rate', label: 'CBIC Rates' },
];

export async function scrapeCBIC(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  for (const src of SOURCES) {
    try {
      logger.info(`[CBIC] Scraping ${src.url}`);
      const $ = await fetchWithRetry(src.url);
      
      // CBIC site uses table rows or list items
      const selectors = [
        'table tbody tr',
        '.panel-body ul li',
        '.panel-body a',
        '.list-group-item',
        'div.col-md-12 a',
      ];
      
      let found = false;
      for (const sel of selectors) {
        const els = $(sel);
        if (els.length > 2) {
          els.each((i, el) => {
            const $el = $(el);
            const linkEl = $el.is('a') ? $el : $el.find('a').first();
            const title = cleanText(linkEl.text() || $el.find('td').first().text());
            if (!title || title.length < 10) return;
            
            let href = linkEl.attr('href') || '';
            href = resolveUrl(href, BASE_URL);
            
            // PDF detection
            let pdfUrl: string | undefined;
            const pdfLink = $el.find('a[href$=".pdf"], a[href$=".PDF"]').first();
            if (pdfLink.length) pdfUrl = resolveUrl(pdfLink.attr('href') || '', BASE_URL);
            if (!pdfUrl && href.toLowerCase().endsWith('.pdf')) pdfUrl = href;
            
            // Date from table cells or spans
            let publishedAt = new Date();
            const cells = $el.find('td');
            if (cells.length >= 2) {
              const dateText = $(cells[1]).text().trim() || $(cells[0]).text().trim();
              const parsed = parseIndianDate(dateText);
              if (parsed) publishedAt = parsed;
            }
            
            const notifMatch = title.match(/(?:Circular|Notification|Order|Instruction)\s*(?:No\.?\s*)?([0-9\/\-A-Za-z]+)/i);
            
            items.push({
              title,
              summary: title,
              category: src.category,
              notificationNo: notifMatch?.[1],
              officialUrl: href || src.url,
              pdfUrl,
              sourceWebsite: BASE_URL,
              tags: ['GST', 'CBIC', src.label, src.category],
              priority: src.category === 'Notification' ? 'HIGH' : 'NORMAL',
              publishedAt,
              department: 'cbic',
            });
          });
          if (items.length > 0) { found = true; break; }
        }
      }
      
      if (!found) {
        $('a[href]').each((i, el) => {
          const title = cleanText($(el).text());
          const href = $(el).attr('href') || '';
          if (title.length < 15 || title.length > 300) return;
          if (/menu|nav|home|login|about|contact|faq|help/i.test(title)) return;
          const resolved = resolveUrl(href, BASE_URL);
          items.push({
            title,
            summary: title,
            category: src.category,
            officialUrl: resolved,
            pdfUrl: href.toLowerCase().includes('.pdf') ? resolved : undefined,
            sourceWebsite: BASE_URL,
            tags: ['CBIC', src.label],
            priority: 'NORMAL',
            publishedAt: new Date(),
            department: 'cbic',
          });
        });
      }
      
      logger.info(`[CBIC] ${src.label}: ${items.length} items total`);
    } catch (err: any) {
      logger.error(`[CBIC] Error scraping ${src.url}: ${err.message}`);
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
