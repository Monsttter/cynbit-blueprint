import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const defaultOrigins = nodeEnv === 'production' ? '' : 'http://localhost:5173,http://localhost:5174';

export const env = {
  port: Number(process.env.PORT) || 4000,
  clientOrigins: (process.env.CLIENT_ORIGIN || defaultOrigins).split(',').map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean),
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiTimeoutMs: Math.min(Math.max(Number(process.env.GEMINI_TIMEOUT_MS) || 12000, 1000), 30000),
};
