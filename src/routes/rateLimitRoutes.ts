import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getRateLimitStatusController } from '../controllers/rateLimitController.js';

const router = Router();

/**
 * @swagger
 * /api/rate-limit/status:
 *   get:
 *     summary: Verifica o status atual do rate limit do usuário
 *     tags: [Rate Limit]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Status do rate limit do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimit'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status', authMiddleware, getRateLimitStatusController);

export default router;
