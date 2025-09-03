import { Router } from 'express';
import { ConversionController, upload } from '../controllers/conversionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { rateLimitMiddleware } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/convert/status:
 *   get:
 *     summary: Obtém informações sobre conversões suportadas
 *     tags: [Conversion]
 *     security: []
 *     responses:
 *       200:
 *         description: Status das conversões disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Serviço de conversão está ativo"
 *                 supportedFormats:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["pdf", "docx", "txt", "png", "jpg"]
 */
router.get('/status', ConversionController.getConversionStatus);

/**
 * @swagger
 * /api/convert/convert:
 *   post:
 *     summary: Converte um arquivo para o formato especificado
 *     tags: [Conversion]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo a ser convertido
 *               targetFormat:
 *                 type: string
 *                 enum: [pdf, docx, txt, png, jpg]
 *                 description: Formato de destino
 *                 example: "pdf"
 *             required:
 *               - file
 *               - targetFormat
 *     responses:
 *       200:
 *         description: Arquivo convertido com sucesso
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Dados inválidos ou formato não suportado
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
router.post('/convert', 
  authMiddleware,
  rateLimitMiddleware,
  upload.single('file'),
  ConversionController.convertFile
);

export default router;
