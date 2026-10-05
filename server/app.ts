import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
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
  // Provides safe diagnostics without exposing secrets
  const healthHandler = async (_req: Request, res: Response) => {
    try {
      await db.init();
      const users = await db.getAllEmployees();

      res.json({
        status: 'healthy',
        app: 'UHF Solutions Digital Card',
        functionRunning: true,
        database: {
          initialized: true,
          provider: 'local-json-firestore',
          employeeCount: users.length,
        },
        jwtConfigured: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0),
        storage: {
          cloudinaryConfigured: Boolean(
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
          ),
          firestoreConfigured: fs.existsSync(path.resolve(process.cwd(), 'firebase-applet-config.json')),
        },
        nodeEnv: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({
        status: 'degraded',
        functionRunning: true,
        error: err.message || 'Health check encountered an issue',
        timestamp: new Date().toISOString(),
      });
    }
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

  // Serve uploaded images from data/assets
  const ASSETS_DIR = path.resolve(process.cwd(), 'data/assets');
  app.use('/api/assets', express.static(ASSETS_DIR));
  app.use('/assets', express.static(ASSETS_DIR));
  app.get(['/api/assets/:filename', '/assets/:filename'], (req: Request, res: Response) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.resolve(ASSETS_DIR, filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  });

  return app;
}

export const app = createExpressApp();
