import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rateLimitMiddleware } from '../middlewares/rateLimitMiddleware';
import { convertFile } from '../controllers/fileController';

const router = Router();

// Rota protegida para conversão de arquivos (com rate limit)
router.post('/convert', authMiddleware, rateLimitMiddleware, convertFile);

export default router;
