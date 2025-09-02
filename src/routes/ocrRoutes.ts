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

// Rota principal para OCR
router.post('/', upload.single('image'), OCRController.extractText);

// Rota para obter idiomas suportados
router.get('/languages', OCRController.getLanguages);

export default router;
