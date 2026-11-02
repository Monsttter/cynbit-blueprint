import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createBlueprintController } from '../controllers/blueprintController.js';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests. Please wait a few minutes and try again.' } });
export default function blueprintRoutes(db, generate) {
  const router = Router();
  const controller = createBlueprintController(db, generate);
  router.post('/', limiter, controller.create);
  router.get('/:reference', limiter, controller.get);
  return router;
}
