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

// Rota principal para compressão de PDF
router.post('/', upload.single('pdf'), CompressionController.compressPDF);

// Rota para obter informações sobre compressão
router.get('/info', CompressionController.getCompressionInfo);

export default router;
