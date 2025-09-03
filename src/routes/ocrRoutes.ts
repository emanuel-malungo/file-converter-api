import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { OCRController } from '../controllers/ocrController.js';
import { rateLimitMiddleware } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'temp', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Aceita apenas imagens
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Envie apenas imagens (JPG, PNG, BMP, TIFF, WEBP).'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limite
  }
});

// Middleware de rate limiting
router.use(rateLimitMiddleware);

/**
 * @swagger
 * /api/ocr:
 *   post:
 *     summary: Extrai texto de imagem usando OCR
 *     tags: [OCR]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagem para extração de texto
 *               language:
 *                 type: string
 *                 default: "eng"
 *                 description: Idioma para reconhecimento (opcional)
 *                 example: "eng"
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: Texto extraído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: Texto extraído da imagem
 *                 confidence:
 *                   type: number
 *                   description: Nível de confiança do OCR
 *       400:
 *         description: Dados inválidos ou arquivo não suportado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit excedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', upload.single('image'), OCRController.extractText);

/**
 * @swagger
 * /api/ocr/languages:
 *   get:
 *     summary: Obtém lista de idiomas suportados para OCR
 *     tags: [OCR]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Lista de idiomas suportados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: "eng"
 *                       name:
 *                         type: string
 *                         example: "English"
 *       429:
 *         description: Rate limit excedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/languages', OCRController.getLanguages);

export default router;
