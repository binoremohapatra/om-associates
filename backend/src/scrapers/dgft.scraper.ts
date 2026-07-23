import { fetchWithRetry, resolveUrl, cleanText, parseIndianDate, ScrapedItem } from './base.scraper';
import { logger } from '../utils/logger';
import axios from 'axios';

const BASE_URL = 'https://www.dgft.gov.in';

const SOURCES = [
  { url: `${BASE_URL}/CP/?opt=tradenotice`, category: 'Trade Notice', label: 'DGFT Trade Notice', tag: 'Trade Notice' },
  { url: `${BASE_URL}/CP/?opt=notification`, category: 'Notification', label: 'DGFT Notification', tag: 'Notification' },
  { url: `${BASE_URL}/CP/?opt=publicnotice`, category: 'Public Notice', label: 'DGFT Public Notice', tag: 'Public Notice' },
];

// DGFT also exposes a JSON endpoint for notices
const DGFT_API_URLS = [
  { url: `${BASE_URL}/CP/FORMS/tradenotice`, category: 'Trade Notice', label: 'DGFT Trade Notice API' },
];

export async function scrapeDGFT(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  
  for (const src of SOURCES) {
    try {
      logger.info(`[DGFT] Scraping ${src.url}`);
      const $ = await fetchWithRetry(src.url);
      
      const selectors = [
        'table.dataTable tbody tr',
        'table tbody tr',
        '#example tbody tr',
        '.dataTables_wrapper tbody tr',
        '.table-responsive tbody tr',
        'div.panel table tbody tr',
      ];
      
      let found = false;
      for (const sel of selectors) {
        const rows = $(sel);
        if (rows.length > 1) {
          rows.each((i, row) => {
            const $row = $(row);
            const cells = $row.find('td');
            if (cells.length < 2) return;
            
            // DGFT table structure: [Serial, Title/Subject, Date, Download]
            let title = '';
            let href = '';
            let dateText = '';
            let pdfUrl: string | undefined;
            
            cells.each((j, cell) => {
              const $cell = $(cell);
              const cellText = cleanText($cell.text());
              
              // Title: usually the longest text cell or one containing a link
              const linkInCell = $cell.find('a').first();
              if (linkInCell.length && cellText.length > 15) {
                title = cleanText(linkInCell.text()) || cellText;
                href = resolveUrl(linkInCell.attr('href') || '', BASE_URL);
                if (href.toLowerCase().includes('.pdf')) pdfUrl = href;
              }
              
              // Date cell
              if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(cellText) ||
                  /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(cellText)) {
                dateText = cellText;
              }
              
              // PDF link
              const pdfInCell = $cell.find('a[href*=".pdf"], a[href*=".PDF"]').first();
              if (pdfInCell.length) pdfUrl = resolveUrl(pdfInCell.attr('href') || '', BASE_URL);
            });
            
            // If we didn't get a title from links, use first substantial cell
            if (!title) title = cleanText($(cells[1]).text() || $(cells[0]).text());
            if (!title || title.length < 10) return;
            
            let publishedAt = new Date();
            if (dateText) {
              const parsed = parseIndianDate(dateText);
              if (parsed) publishedAt = parsed;
            }
            
            const notifMatch = title.match(/(?:Trade Notice|Notification|Public Notice)\s*(?:No\.?\s*)?([0-9\/\-]+)/i);
            
            items.push({
              title,
              summary: title,
              category: src.category,
              notificationNo: notifMatch?.[1],
              officialUrl: href || src.url,
              pdfUrl,
              sourceWebsite: BASE_URL,
              tags: ['DGFT', 'Import-Export', src.tag, src.category],
              priority: src.category === 'Notification' ? 'HIGH' : 'NORMAL',
              publishedAt,
              department: 'dgft',
            });
          });
          if (items.length > 0) { found = true; break; }
        }
      }
      
      if (!found) {
        $('a').each((i, el) => {
          const title = cleanText($(el).text());
          const href = $(el).attr('href') || '';
          if (title.length < 15 || title.length > 300) return;
          if (/home|login|register|menu|nav/i.test(title)) return;
          const resolved = resolveUrl(href, BASE_URL);
          items.push({
            title, summary: title, category: src.category,
            officialUrl: resolved, pdfUrl: href.includes('.pdf') ? resolved : undefined,
            sourceWebsite: BASE_URL, tags: ['DGFT', src.tag], priority: 'NORMAL',
            publishedAt: new Date(), department: 'dgft',
          });
        });
      }
      
      logger.info(`[DGFT] ${src.label}: ${items.length} items total`);
    } catch (err: any) {
      logger.error(`[DGFT] Error scraping ${src.url}: ${err.message}`);
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
