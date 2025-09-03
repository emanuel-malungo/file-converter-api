import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { CompressionController } from '../controllers/compressionController.js';
import { rateLimitMiddleware } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

// Configuração do multer para upload de PDFs
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
  // Aceita apenas PDFs
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Envie apenas arquivos PDF.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limite
  }
});

// Middleware de rate limiting
router.use(rateLimitMiddleware);

/**
 * @swagger
 * /api/compress:
 *   post:
 *     summary: Comprime um arquivo PDF
 *     tags: [Compression]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo PDF para compressão
 *               quality:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 70
 *                 description: Qualidade da compressão (opcional)
 *                 example: 70
 *             required:
 *               - pdf
 *     responses:
 *       200:
 *         description: PDF comprimido com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
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
router.post('/', upload.single('pdf'), CompressionController.compressPDF);

/**
 * @swagger
 * /api/compress/info:
 *   get:
 *     summary: Obtém informações sobre o serviço de compressão
 *     tags: [Compression]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Informações do serviço de compressão
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Serviço de compressão está ativo"
 *                 supportedFormats:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["pdf"]
 *                 maxFileSize:
 *                   type: string
 *                   example: "50MB"
 *       429:
 *         description: Rate limit excedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/info', CompressionController.getCompressionInfo);

export default router;
