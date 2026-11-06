import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import workOrderRoutes from './routes/workOrderRoutes';
import scopeChangeRoutes from './routes/scopeChangeRoutes';
import completionRoutes from './routes/completionRoutes';
import disputeRoutes from './routes/disputeRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Trust proxy for Render / Vercel load balancers
  app.set('trust proxy', 1);

  // Security Middleware
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

  // CORS Middleware - allow Vercel, localhost, and custom frontend URLs
  app.use(cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, server-to-server or any origin
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  }));

  app.options('*', cors());

  // Logger
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate Limiting for Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Root & Health Check Endpoints
  app.get('/', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'ServiceVisit Tracker API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: '/api/health',
    });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'ServiceVisit Tracker API',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/work-orders', workOrderRoutes);
  app.use('/api/scope-changes', scopeChangeRoutes);
  app.use('/api/completion', completionRoutes);
  app.use('/api/disputes', disputeRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 Handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

