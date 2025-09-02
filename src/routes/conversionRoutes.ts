import { Router } from 'express';
import { ConversionController, upload } from '../controllers/conversionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rateLimitMiddleware } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// Rota para obter informações sobre conversões suportadas
router.get('/status', ConversionController.getConversionStatus);

// Rota principal de conversão (protegida por auth e rate limit)
router.post('/convert', 
  authMiddleware,
  rateLimitMiddleware,
  upload.single('file'),
  ConversionController.convertFile
);

export default router;
