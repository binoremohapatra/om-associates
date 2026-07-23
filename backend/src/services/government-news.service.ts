import crypto from 'crypto';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { ScrapedItem } from '../scrapers/base.scraper';
import { scrapeGstCouncil } from '../scrapers/gst-council.scraper';
import { scrapeCBIC } from '../scrapers/cbic.scraper';
import { scrapeIncomeTax } from '../scrapers/income-tax.scraper';
import { scrapeDGFT } from '../scrapers/dgft.scraper';
import { scrapeMCA } from '../scrapers/mca.scraper';

// ── In-memory cache (used when Redis unavailable) ─────────────────
interface CacheEntry { data: any; expiresAt: number; }
const memCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function memGet<T>(key: string): T | null {
  const entry = memCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) { memCache.delete(key); return null; }
  return entry.data as T;
}
function memSet(key: string, data: any, ttlMs = CACHE_TTL_MS): void {
  memCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ── Department seed data ──────────────────────────────────────────
const DEPARTMENTS = [
  { slug: 'gst-council', name: 'GST Council', shortName: 'GST', description: 'Official GST Council of India', website: 'https://www.gstcouncil.gov.in', logoColor: '#1A73E8' },
  { slug: 'cbic', name: 'Central Board of Indirect Taxes', shortName: 'CBIC', description: 'CBIC — GST, Customs & Central Excise', website: 'https://cbic-gst.gov.in', logoColor: '#0F9D58' },
  { slug: 'income-tax', name: 'Income Tax Department', shortName: 'IT', description: 'CBDT — Income Tax & TDS', website: 'https://www.incometaxindia.gov.in', logoColor: '#F4B400' },
  { slug: 'dgft', name: 'Directorate General of Foreign Trade', shortName: 'DGFT', description: 'DGFT — Import/Export & IEC', website: 'https://www.dgft.gov.in', logoColor: '#DB4437' },
  { slug: 'mca', name: 'Ministry of Corporate Affairs', shortName: 'MCA', description: 'MCA — Company Law & ROC', website: 'https://www.mca.gov.in', logoColor: '#7B1FA2' },
];

export async function ensureDepartments(): Promise<Map<string, string>> {
  const deptMap = new Map<string, string>();
  for (const dept of DEPARTMENTS) {
    const d = await prisma.govDepartment.upsert({
      where: { slug: dept.slug },
      create: dept,
      update: { name: dept.name, website: dept.website },
    });
    deptMap.set(dept.slug, d.id);
  }
  return deptMap;
}

function computeHash(title: string, url: string): string {
  return crypto.createHash('sha256').update(`${title}::${url}`).digest('hex');
}

export async function syncAllSources(): Promise<{ total: number; newItems: number; errors: number }> {
  logger.info('[GovNews] Starting sync of all government sources...');
  const syncLog = await prisma.govSyncLog.create({ data: {} });
  
  let total = 0, newItems = 0, errors = 0;
  const deptMap = await ensureDepartments();
  
  const scrapers: Array<{ name: string; fn: () => Promise<ScrapedItem[]> }> = [
    { name: 'gst-council', fn: scrapeGstCouncil },
    { name: 'cbic', fn: scrapeCBIC },
    { name: 'income-tax', fn: scrapeIncomeTax },
    { name: 'dgft', fn: scrapeDGFT },
    { name: 'mca', fn: scrapeMCA },
  ];
  
  for (const scraper of scrapers) {
    const start = Date.now();
    let fetched = 0, inserted = 0;
    try {
      const items = await scraper.fn();
      fetched = items.length;
      total += fetched;
      
      for (const item of items) {
        const hash = computeHash(item.title, item.officialUrl);
        const deptId = deptMap.get(item.department);
        if (!deptId) continue;
        
        // Skip if already exists
        const exists = await prisma.governmentNews.findUnique({ where: { contentHash: hash }, select: { id: true } });
        if (exists) continue;
        
        await prisma.governmentNews.create({
          data: {
            departmentId: deptId,
            title: item.title,
            summary: item.summary,
            category: item.category,
            notificationNo: item.notificationNo,
            officialUrl: item.officialUrl,
            pdfUrl: item.pdfUrl,
            sourceWebsite: item.sourceWebsite,
            tags: item.tags,
            priority: item.priority,
            publishedAt: item.publishedAt,
            contentHash: hash,
            readTimeMinutes: Math.max(1, Math.ceil((item.title?.length || 100) / 200)),
          },
        });
        inserted++;
        newItems++;
      }
      
      await prisma.fetchHistory.create({
        data: {
          syncLogId: syncLog.id,
          department: scraper.name,
          url: scraper.name,
          status: 'SUCCESS',
          itemsFetched: fetched,
          itemsNew: inserted,
          durationMs: Date.now() - start,
        },
      });
      logger.info(`[GovNews] ${scraper.name}: ${fetched} fetched, ${inserted} new`);
    } catch (err: any) {
      errors++;
      logger.error(`[GovNews] ${scraper.name} failed: ${err.message}`);
      await prisma.fetchHistory.create({
        data: {
          syncLogId: syncLog.id,
          department: scraper.name,
          url: scraper.name,
          status: 'FAILED',
          itemsFetched: fetched,
          itemsNew: 0,
          durationMs: Date.now() - start,
          errorMessage: err.message,
        },
      }).catch(() => {});
    }
  }
  
  await prisma.govSyncLog.update({
    where: { id: syncLog.id },
    data: {
      completedAt: new Date(),
      totalFetched: total,
      totalNew: newItems,
      totalErrors: errors,
      status: errors === scrapers.length ? 'FAILED' : errors > 0 ? 'PARTIAL' : 'SUCCESS',
    },
  });
  
  // Invalidate cache on sync
  memCache.clear();
  
  logger.info(`[GovNews] Sync complete: ${total} fetched, ${newItems} new, ${errors} errors`);
  return { total, newItems, errors };
}

export interface NewsQuery {
  department?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  tags?: string[];
  sort?: 'newest' | 'oldest';
}

export async function getNews(query: NewsQuery = {}) {
  const { department, category, search, page = 1, limit = 20, tags, sort = 'newest' } = query;
  const cacheKey = `news:${JSON.stringify(query)}`;
  const cached = memGet<any>(cacheKey);
  if (cached) return cached;
  
  const where: any = { isActive: true };
  if (department) {
    const dept = await prisma.govDepartment.findUnique({ where: { slug: department } });
    if (dept) where.departmentId = dept.id;
  }
  if (category) where.category = { contains: category, mode: 'insensitive' };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
      { notificationNo: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (tags?.length) where.tags = { hasSome: tags };
  
  const [data, totalCount] = await Promise.all([
    prisma.governmentNews.findMany({
      where,
      include: { department: { select: { name: true, shortName: true, logoColor: true, website: true } } },
      orderBy: { publishedAt: sort === 'newest' ? 'desc' : 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.governmentNews.count({ where }),
  ]);
  
  const result = { data, totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) };
  memSet(cacheKey, result, 15 * 60 * 1000);
  return result;
}

export async function getLatestNews(perDept = 5) {
  const cacheKey = `news:latest:${perDept}`;
  const cached = memGet<any>(cacheKey);
  if (cached) return cached;
  
  const departments = await prisma.govDepartment.findMany({ where: { isActive: true } });
  const result: Record<string, any[]> = {};
  
  await Promise.all(departments.map(async (dept) => {
    const items = await prisma.governmentNews.findMany({
      where: { departmentId: dept.id, isActive: true },
      include: { department: { select: { name: true, shortName: true, logoColor: true } } },
      orderBy: { publishedAt: 'desc' },
      take: perDept,
    });
    result[dept.slug] = items;
  }));
  
  memSet(cacheKey, result, 15 * 60 * 1000);
  return result;
}

export async function getNewsById(id: string) {
  return prisma.governmentNews.findUnique({
    where: { id },
    include: { department: true },
  });
}

export async function getStats() {
  const cacheKey = 'news:stats';
  const cached = memGet<any>(cacheKey);
  if (cached) return cached;
  
  const [totalCount, deptCounts, lastSync, recentCount] = await Promise.all([
    prisma.governmentNews.count({ where: { isActive: true } }),
    prisma.governmentNews.groupBy({ by: ['departmentId'], _count: true, where: { isActive: true } }),
    prisma.govSyncLog.findFirst({ orderBy: { startedAt: 'desc' }, where: { status: { in: ['SUCCESS', 'PARTIAL'] } } }),
    prisma.governmentNews.count({ where: { isActive: true, publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
  ]);
  
  const departments = await prisma.govDepartment.findMany({ where: { isActive: true } });
  const deptStats = departments.map(d => ({
    slug: d.slug, name: d.name, shortName: d.shortName, logoColor: d.logoColor,
    count: deptCounts.find((dc: any) => dc.departmentId === d.id)?._count || 0,
  }));
  
  const result = { totalCount, deptStats, lastSync: lastSync?.completedAt, recentCount };
  memSet(cacheKey, result, 10 * 60 * 1000);
  return result;
}

export async function addBookmark(userId: string, newsId: string) {
  return prisma.userBookmark.upsert({
    where: { userId_newsId: { userId, newsId } },
    create: { userId, newsId },
    update: {},
  });
}

export async function removeBookmark(userId: string, newsId: string) {
  return prisma.userBookmark.deleteMany({ where: { userId, newsId } });
}

export async function getBookmarks(userId: string) {
  return prisma.userBookmark.findMany({
    where: { userId },
    include: {
      news: { include: { department: { select: { name: true, shortName: true, logoColor: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDashboardWidgets() {
  const cacheKey = 'news:dashboard';
  const cached = memGet<any>(cacheKey);
  if (cached) return cached;
  
  const deptSlugs = ['gst-council', 'cbic', 'income-tax', 'dgft', 'mca'];
  const widgets: Record<string, any> = {};
  
  await Promise.all(deptSlugs.map(async (slug) => {
    const dept = await prisma.govDepartment.findUnique({ where: { slug } });
    if (!dept) return;
    const latest = await prisma.governmentNews.findFirst({
      where: { departmentId: dept.id, isActive: true },
      include: { department: { select: { name: true, shortName: true, logoColor: true } } },
      orderBy: { publishedAt: 'desc' },
    });
    widgets[slug] = latest;
  }));
  
  const result = { widgets, updatedAt: new Date() };
  memSet(cacheKey, result, 10 * 60 * 1000);
  return result;
}
