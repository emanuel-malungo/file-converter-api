import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { FileConverter } from '../core/converter.js';

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'temp', 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `upload_${timestamp}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['.pdf', '.docx'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use apenas PDF ou DOCX.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

export class ConversionController {
  static async convertFile(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      const { targetFormat } = req.body;

      // Validações
      if (!file) {
        res.status(400).json({
          success: false,
          error: 'Nenhum arquivo foi enviado'
        });
        return;
      }

      if (!targetFormat || !['pdf', 'docx'].includes(targetFormat)) {
        res.status(400).json({
          success: false,
          error: 'Formato de destino inválido. Use "pdf" ou "docx"'
        });
        return;
      }

      // Verifica se a conversão é necessária
      const inputExtension = path.extname(file.originalname).toLowerCase();
      const targetExtension = targetFormat === 'pdf' ? '.pdf' : '.docx';

      if (inputExtension === targetExtension) {
        res.status(400).json({
          success: false,
          error: 'O arquivo já está no formato solicitado'
        });
        return;
      }

      // Gera nome do arquivo de saída
      const outputPath = await FileConverter.generateTempFilename(
        file.originalname,
        targetFormat
      );

      // Realiza a conversão
      const result = await FileConverter.convertFile({
        inputPath: file.path,
        outputPath,
        targetFormat: targetFormat as 'pdf' | 'docx'
      });

      // Limpa o arquivo de entrada
      await FileConverter.cleanupFile(file.path);

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: result.error || 'Erro na conversão'
        });
        return;
      }

      // Lê o arquivo convertido para enviar na resposta
      const convertedFile = await fs.readFile(result.outputPath!);
      const filename = `${path.parse(file.originalname).name}.${targetFormat}`;

      // Define headers para download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', targetFormat === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      // Envia o arquivo
      res.send(convertedFile);

      // Limpa o arquivo de saída após um tempo
      setTimeout(async () => {
        await FileConverter.cleanupFile(result.outputPath!);
      }, 60000); // 1 minuto

    } catch (error) {
      console.error('Erro na conversão:', error);
      
      // Limpa arquivo de entrada se existir
      if (req.file?.path) {
        await FileConverter.cleanupFile(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  static async getConversionStatus(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      supportedConversions: [
        { from: 'docx', to: 'pdf' },
        { from: 'pdf', to: 'docx' }
      ],
      maxFileSize: '10MB',
      allowedFormats: ['pdf', 'docx']
    });
  }
}
