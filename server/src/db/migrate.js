import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

if (!pool) throw new Error('DATABASE_URL must be set before running migrations.');
const migrationUrl = new URL('./migrations/001_initial.sql', import.meta.url);
const sourceMigrationUrl = new URL('./migrations/002_gemini_generation_source.sql', import.meta.url);
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(await readFile(fileURLToPath(migrationUrl), 'utf8'));
  await client.query(await readFile(fileURLToPath(sourceMigrationUrl), 'utf8'));
  await client.query('COMMIT');
  console.log('Database migrations 001 and 002 applied.');
} catch (error) {
  try { await client.query('ROLLBACK'); } catch { /* preserve the migration error */ }
  console.error('Database migrations failed; changes were rolled back.');
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
