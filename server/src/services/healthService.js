export async function getHealthStatus(db) {
  let database = 'unavailable';
  if (db) {
    try { await db.query('SELECT 1'); database = 'connected'; }
    catch { database = 'unavailable'; }
  }
  return { status: database === 'connected' ? 'ok' : 'degraded', service: 'cynbit-blueprint-api', database, timestamp: new Date().toISOString() };
}
