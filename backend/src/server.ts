import { app } from './app';
import { config } from './config';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import gstRoutes from './routes/gst.routes';
import documentRoutes from './routes/document.routes';
import paymentRoutes from './routes/payment.routes';
import incomeTaxRoutes from './routes/income-tax.routes';
import newsRoutes from './routes/news.routes';
import appointmentRoutes from './routes/appointment.routes';
import legalRoutes from './routes/legal.routes';
import importExportRoutes from './routes/import-export.routes';
import { startScheduler } from './jobs/scheduler';

async function bootstrap() {
  try {
    await connectDatabase();
    logger.info('Database connected');

    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/dashboard', dashboardRoutes);
    app.use('/api/v1/gst', gstRoutes);
    app.use('/api/v1/documents', documentRoutes);
    app.use('/api/v1/payments', paymentRoutes);
    app.use('/api/v1/income-tax', incomeTaxRoutes);
    app.use('/api/v1/news', newsRoutes);
    app.use('/api/v1/appointments', appointmentRoutes);
    app.use('/api/v1/legal', legalRoutes);
    app.use('/api/v1/import-export', importExportRoutes);

    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`Server listening at http://${config.server.host}:${config.server.port}/api/v1`);
      startScheduler();
    });

    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(async () => {
        await disconnectDatabase();
        logger.info('Shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
