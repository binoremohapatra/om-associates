import cron from 'node-cron';
import { logger } from '../utils/logger';
import { runNewsSync } from './news-sync.job';

let schedulerStarted = false;

export function startScheduler(): void {
  if (schedulerStarted) return;
  schedulerStarted = true;
  
  // Run immediately on startup (with 10s delay to let DB connect)
  setTimeout(async () => {
    logger.info('[Scheduler] Running initial news sync on startup...');
    await runNewsSync().catch(err => logger.error(`[Scheduler] Initial sync failed: ${err.message}`));
  }, 10000);
  
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    logger.info('[Scheduler] Hourly news sync triggered by cron...');
    await runNewsSync().catch(err => logger.error(`[Scheduler] Cron sync failed: ${err.message}`));
  });
  
  logger.info('[Scheduler] News sync scheduler started (runs every hour)');
}
