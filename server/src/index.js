import app from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`Cynbit Blueprint API listening on port ${env.port}`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; shutting down gracefully.`);
  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out.');
    process.exit(1);
  }, 10000);
  forceExit.unref();
  server.close(async (error) => {
    server.closeIdleConnections?.();
    try { await pool?.end(); }
    catch { console.error('Database pool shutdown failed.'); process.exitCode = 1; }
    if (error) { console.error('HTTP server shutdown failed.'); process.exitCode = 1; }
    clearTimeout(forceExit);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
