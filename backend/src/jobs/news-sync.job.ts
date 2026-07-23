import { syncAllSources, ensureDepartments } from '../services/government-news.service';
import { logger } from '../utils/logger';

let syncRunning = false;
let lastSyncResult: { total: number; newItems: number; errors: number; timestamp: Date } | null = null;

export async function runNewsSync(): Promise<void> {
  if (syncRunning) {
    logger.warn('[NewsSync] Sync already in progress, skipping...');
    return;
  }
  syncRunning = true;
  try {
    logger.info('[NewsSync] Starting hourly news sync...');
    await ensureDepartments();
    const result = await syncAllSources();
    lastSyncResult = { ...result, timestamp: new Date() };
    logger.info(`[NewsSync] Sync completed: ${result.total} fetched, ${result.newItems} new`);
  } catch (err: any) {
    logger.error(`[NewsSync] Fatal error during sync: ${err.message}`);
  } finally {
    syncRunning = false;
  }
}

export function getSyncStatus() {
  return { running: syncRunning, lastSync: lastSyncResult };
}
