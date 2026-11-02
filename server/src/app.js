import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { notFound } from './middleware/notFound.js';
import blueprintRoutes from './routes/blueprintRoutes.js';
import { createHealthRoutes } from './routes/healthRoutes.js';
import { pool as defaultPool } from './db/pool.js';
import { generateBlueprintWithSource } from './services/blueprintGenerationService.js';

export function createApp({ db = defaultPool, generate = generateBlueprintWithSource } = {}) {
  if (env.nodeEnv === 'production' && !env.clientOrigins.length) throw new Error('CLIENT_ORIGIN must contain the deployed frontend origin in production.');
  if (env.nodeEnv === 'production' && !env.databaseUrl) throw new Error('DATABASE_URL must be configured in production.');
  const app = express();
  app.disable('x-powered-by');
  if (env.nodeEnv === 'production') app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: (origin, callback) => callback(null, !origin || env.clientOrigins.includes(origin)) }));
  app.use(express.json({ limit: '32kb' }));
  app.use('/api/health', createHealthRoutes(db));
  app.use('/api/blueprints', blueprintRoutes(db, generate));
  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.too.large') return response.status(413).json({ error: 'Request is too large.' });
    if (error instanceof SyntaxError && 'body' in error) return response.status(400).json({ error: 'Request body must be valid JSON.' });
    return response.status(500).json({ error: 'An unexpected server error occurred.' });
  });
  app.use(notFound);
  return app;
}

const app = createApp();
export default app;
