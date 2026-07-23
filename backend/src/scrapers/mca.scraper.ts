import { fetchWithRetry, resolveUrl, cleanText, parseIndianDate, ScrapedItem } from './base.scraper';
import { logger } from '../utils/logger';

const BASE_URL = 'https://www.mca.gov.in';
const SOURCES = [
  {
    url: `${BASE_URL}/content/mca/global/en/acts-rules/ebooks/circulars.html`,
    category: 'Circular', label: 'MCA Circular',
  },
  {
    url: `${BASE_URL}/content/mca/global/en/data-and-reports/company-statistics/general-circulars.html`,
    category: 'Circular', label: 'MCA General Circular',
  },
  {
    url: `${BASE_URL}/content/mca/global/en/acts-rules/ebooks/notifications.html`,
    category: 'Notification', label: 'MCA Notification',
  },
];

export async function scrapeMCA(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  for (const src of SOURCES) {
    try {
      logger.info(`[MCA] Scraping ${src.url}`);
      const $ = await fetchWithRetry(src.url);
      
      const selectors = [
        'table tbody tr',
        '.view-content .views-row',
        'ul.document-list li',
        '.panel-body ul li',
        'div.umb-block-list a',
        'article ul li',
        '.field__items .field__item',
      ];
      
      let found = false;
      for (const sel of selectors) {
        const els = $(sel);
        if (els.length > 1) {
          els.each((i, el) => {
            const $el = $(el);
            const linkEl = $el.is('a') ? $el : $el.find('a').first();
            const title = cleanText(linkEl.text() || $el.text());
            if (!title || title.length < 10) return;
            
            let href = linkEl.attr('href') || '';
            href = resolveUrl(href, BASE_URL);
            
            let pdfUrl: string | undefined;
            const pdfLink = $el.find('a[href*=".pdf"], a[href*=".PDF"]').first();
            if (pdfLink.length) pdfUrl = resolveUrl(pdfLink.attr('href') || '', BASE_URL);
            if (!pdfUrl && href.toLowerCase().endsWith('.pdf')) pdfUrl = href;
            
            let publishedAt = new Date();
            const dateEl = $el.find('time, .date, .created').first();
            if (dateEl.length) {
              const parsed = parseIndianDate(dateEl.attr('datetime') || dateEl.text());
              if (parsed) publishedAt = parsed;
            } else {
              const yearMatch = title.match(/\b(20[0-9]{2})\b/);
              if (yearMatch) publishedAt = new Date(parseInt(yearMatch[1]), 0, 1);
              const dateMatch = $el.find('td').length > 1 ?
                parseIndianDate($($el.find('td')[1]).text()) : null;
              if (dateMatch) publishedAt = dateMatch;
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
              tags: ['MCA', 'Legal', 'ROC', src.label, src.category],
              priority: src.category === 'Notification' ? 'HIGH' : 'NORMAL',
              publishedAt,
              department: 'mca',
            });
          });
          if (items.length > 0) { found = true; break; }
        }
      }
      
      if (!found) {
        $('a[href]').each((i, el) => {
          const title = cleanText($(el).text());
          const href = $(el).attr('href') || '';
          if (title.length < 12 || title.length > 350) return;
          if (/home|login|menu|sitemap|search|about|contact|faq/i.test(title)) return;
          const resolved = resolveUrl(href, BASE_URL);
          items.push({
            title, summary: title, category: src.category,
            officialUrl: resolved, pdfUrl: href.includes('.pdf') ? resolved : undefined,
            sourceWebsite: BASE_URL, tags: ['MCA', 'Legal'], priority: 'NORMAL',
            publishedAt: new Date(), department: 'mca',
          });
        });
      }
      
      logger.info(`[MCA] ${src.label}: ${items.length} items total`);
    } catch (err: any) {
      logger.error(`[MCA] Error scraping ${src.url}: ${err.message}`);
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
