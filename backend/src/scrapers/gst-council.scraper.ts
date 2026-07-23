import { fetchWithRetry, resolveUrl, cleanText, parseIndianDate, ScrapedItem } from './base.scraper';
import { logger } from '../utils/logger';

const BASE_URL = 'https://www.gstcouncil.gov.in';
const SOURCES = [
  { url: `${BASE_URL}/central-gst`, label: 'CGST', category: 'Notification' },
  { url: `${BASE_URL}/utgst`, label: 'UTGST', category: 'Notification' },
  { url: `${BASE_URL}/node/41`, label: 'GST Council', category: 'Press Release' },
];

export async function scrapeGstCouncil(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  for (const src of SOURCES) {
    try {
      logger.info(`[GSTCouncil] Scraping ${src.url}`);
      const $ = await fetchWithRetry(src.url);
      
      // Try multiple selectors used by Drupal CMS on this site
      const selectors = [
        '.view-content .views-row',
        '.node__content ul li',
        '.field--type-text-long ul li',
        'article .field__item ul li',
        '.views-field-title a',
        'table.views-table tbody tr',
      ];
      
      let found = false;
      for (const sel of selectors) {
        const els = $(sel);
        if (els.length > 2) {
          els.each((i, el) => {
            const $el = $(el);
            const linkEl = $el.is('a') ? $el : $el.find('a').first();
            const title = cleanText(linkEl.text() || $el.text());
            if (!title || title.length < 10) return;
            
            let href = linkEl.attr('href') || '';
            href = resolveUrl(href, src.url);
            
            // Extract PDF link if present
            let pdfUrl: string | undefined;
            const pdfLink = $el.find('a[href*=".pdf"], a[href*="PDF"]').first();
            if (pdfLink.length) pdfUrl = resolveUrl(pdfLink.attr('href') || '', src.url);
            
            // Extract notification number from title
            const notifMatch = title.match(/(?:Notification|Circular|Order)\s+(?:No\.?\s*)?([0-9\/\-A-Za-z]+)/i);
            
            // Extract date
            let publishedAt = new Date();
            const dateEl = $el.find('.date-display-single, .views-field-created, time').first();
            if (dateEl.length) {
              const parsed = parseIndianDate(dateEl.text() || dateEl.attr('datetime') || '');
              if (parsed) publishedAt = parsed;
            } else {
              const yearMatch = title.match(/\b(20[0-9]{2})\b/);
              if (yearMatch) publishedAt = new Date(parseInt(yearMatch[1]), 0, 1);
            }
            
            items.push({
              title,
              summary: title,
              category: src.category,
              notificationNo: notifMatch?.[1],
              officialUrl: href || src.url,
              pdfUrl,
              sourceWebsite: BASE_URL,
              tags: ['GST', src.label, src.category],
              priority: 'NORMAL',
              publishedAt,
              department: 'gst-council',
            });
          });
          if (items.length > 0) { found = true; break; }
        }
      }
      
      if (!found) {
        // Fallback: grab all meaningful anchor tags
        $('a').each((i, el) => {
          const title = cleanText($(el).text());
          const href = $(el).attr('href') || '';
          if (title.length < 15 || title.length > 300) return;
          if (href.startsWith('#') || href.includes('javascript')) return;
          if (/menu|nav|logo|sitemap|faq|rti|skip|social|screen/i.test(title)) return;
          
          const resolved = resolveUrl(href, src.url);
          items.push({
            title,
            summary: title,
            category: src.category,
            officialUrl: resolved,
            sourceWebsite: BASE_URL,
            tags: ['GST', src.label],
            priority: 'NORMAL',
            publishedAt: new Date(),
            department: 'gst-council',
          });
        });
      }
      
      logger.info(`[GSTCouncil] ${src.label}: ${items.length} items so far`);
    } catch (err: any) {
      logger.error(`[GSTCouncil] Error scraping ${src.url}: ${err.message}`);
    }
  }
  
  // Deduplicate by title within this scraper
  const seen = new Set<string>();
  return items.filter(item => {
    const key = item.title.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 50);
}
