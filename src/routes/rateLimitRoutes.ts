import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getRateLimitStatusController } from '../controllers/rateLimitController.js';

const router = Router();

// Rota para verificar status do rate limit
router.get('/status', authMiddleware, getRateLimitStatusController);

export default router;
