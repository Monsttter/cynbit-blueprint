import pg from 'pg';
import { env } from '../config/env.js';

export const pool = env.databaseUrl ? new pg.Pool({ connectionString: env.databaseUrl, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 }) : null;

if (pool) pool.on('error', () => console.error('A database connection error occurred.'));
