import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';

export interface ScrapedItem {
  title: string;
  summary?: string;
  category: string;
  notificationNo?: string;
  officialUrl: string;
  pdfUrl?: string;
  sourceWebsite: string;
  tags: string[];
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  publishedAt: Date;
  department: string;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

const domainLastRequest: Record<string, number> = {};
const MIN_DELAY_MS = 2000;

async function rateLimitedDelay(domain: string): Promise<void> {
  const now = Date.now();
  const last = domainLastRequest[domain] || 0;
  const wait = Math.max(0, MIN_DELAY_MS - (now - last));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  domainLastRequest[domain] = Date.now();
}

export async function fetchWithRetry(
  url: string,
  config: AxiosRequestConfig = {},
  maxRetries = 3
): Promise<cheerio.CheerioAPI> {
  const domain = new URL(url).hostname;
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await rateLimitedDelay(domain);
      const response = await axios.get(url, {
        timeout: 20000,
        headers: {
          'User-Agent': USER_AGENTS[attempt % USER_AGENTS.length],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          ...config.headers,
        },
        ...config,
      });
      return cheerio.load(response.data);
    } catch (err: any) {
      lastError = err;
      const retryable = !err.response || err.response.status >= 500 || err.code === 'ECONNRESET';
      if (!retryable || attempt === maxRetries) break;
      const backoff = Math.min(1000 * Math.pow(2, attempt), 8000);
      logger.info(`[Scraper] Retry ${attempt}/${maxRetries} for ${url} in ${backoff}ms`);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
  throw lastError;
}

export function resolveUrl(href: string, base: string): string {
  try {
    if (!href) return base;
    if (href.startsWith('http')) return href;
    if (href.startsWith('/')) { const u = new URL(base); return `${u.origin}${href}`; }
    return new URL(href, base).href;
  } catch { return href; }
}

export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
}

export function parseIndianDate(text: string): Date | null {
  const months: Record<string, number> = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  const t = text.toLowerCase().trim();
  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[,\s]+(\d{4})/i,
  ];
  for (const pattern of patterns) {
    const m = t.match(pattern);
    if (m) {
      try {
        let d: Date;
        if (pattern.source.includes('jan')) {
          d = new Date(parseInt(m[3]), months[m[2].toLowerCase()], parseInt(m[1]));
        } else if (pattern.source.startsWith('(\\d{4})')) {
          d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
        } else {
          d = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
        }
        if (!isNaN(d.getTime()) && d.getFullYear() >= 2000) return d;
      } catch { continue; }
    }
  }
  return null;
}
