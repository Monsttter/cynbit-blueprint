import { Router } from 'express';
import { createHealthController } from '../controllers/healthController.js';

export function createHealthRoutes(db) {
  const router = Router();
  router.get('/', createHealthController(db));
  return router;
}

export default createHealthRoutes;
