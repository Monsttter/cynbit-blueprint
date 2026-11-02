import { getHealthStatus } from '../services/healthService.js';

export function createHealthController(db) {
  return async function healthController(_request, response) {
    const health = await getHealthStatus(db);
    response.status(health.status === 'ok' ? 200 : 503).json(health);
  };
}
