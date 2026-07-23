import 'dotenv/config'; // Load immediately!
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import passport from 'passport';
import path from 'path';
import './config/passport';
import { config } from './config';
import { requestId, httpLogger } from './middleware/request';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import gstRoutes from './routes/gst.routes';
import invoiceRoutes from './routes/invoice.routes';
import reportRoutes from './routes/report.routes';
import aiRoutes from './routes/ai.routes';
import userRoutes from './routes/user.routes';
import taxRoutes from './routes/tax.routes';
import platformRoutes from './routes/platform.routes';
import analyticsRoutes from './routes/analytics.routes';
import newsRoutes from './routes/news.routes';
import dashboardRoutes from './routes/dashboard.routes';
import incomeTaxRoutes from './routes/income-tax.routes';
import legalRoutes from './routes/legal.routes';
import importExportRoutes from './routes/import-export.routes';
import appointmentRoutes from './routes/appointment.routes';

const app = express();

// Security & Utility Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.server.corsOrigins,
    credentials: true, // Allow cookies
  })
);



app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(compression());
app.use(passport.initialize());
app.use(requestId);
app.use(httpLogger);

// ── API Routes ────────────────────────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK', timestamp: new Date() } });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/clients', clientRoutes);
apiRouter.use('/tax', taxRoutes);
apiRouter.use('/gst', gstRoutes);
apiRouter.use('/invoices', invoiceRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/platform', platformRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/news', newsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/income-tax', incomeTaxRoutes);
apiRouter.use('/legal', legalRoutes);
apiRouter.use('/import-export', importExportRoutes);
apiRouter.use('/appointments', appointmentRoutes);

app.use('/api/v1', apiRouter);

// ── Static Files (Uploads) ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── 404 & Global Error Handler ────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` },
  });
});

app.use(errorHandler);

export { app };
