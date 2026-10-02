import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.ts';
import { publicRouter } from './routes/public.ts';
import { employeeRouter } from './routes/employee.ts';
import { adminRouter } from './routes/admin.ts';
import { uploadRouter } from './routes/upload.ts';
import { db } from './db.ts';

export function createExpressApp(): Express {
  const app = express();

  // Basic middleware
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use(cookieParser());

  // URL normalization middleware
  // Handles Netlify Function rewrites (/.netlify/functions/api/...)
  // and ensures uniform routing across local dev and serverless environments.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    // 1. Strip Netlify function prefix if present
    if (req.url.startsWith('/.netlify/functions/api')) {
      req.url = req.url.replace('/.netlify/functions/api', '') || '/';
    }
    // 2. Ensure leading slash
    if (!req.url.startsWith('/')) {
      req.url = '/' + req.url;
    }
    next();
  });

  // Health check endpoint (available at both /api/health and /health)
  const healthHandler = (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'UHF Solutions Digital Card',
      timestamp: new Date().toISOString(),
    });
  };
  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Mount API routes at both /api/* and /* for maximum Netlify rewrite compatibility
  app.use('/api/auth', authRouter);
  app.use('/auth', authRouter);

  app.use('/api/public', publicRouter);
  app.use('/public', publicRouter);

  app.use('/api/employee', employeeRouter);
  app.use('/employee', employeeRouter);

  app.use('/api/admin', adminRouter);
  app.use('/admin', adminRouter);

  app.use('/api/upload', uploadRouter);
  app.use('/upload', uploadRouter);

  return app;
}

export const app = createExpressApp();
