import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getRateLimitStatusController } from '../controllers/rateLimitController';

const router = Router();

// Rota para verificar status do rate limit
router.get('/status', authMiddleware, getRateLimitStatusController);

export default router;
