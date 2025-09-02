import type { Request, Response } from 'express';
import { FileConverter } from '../core/converter.js';
import path from 'path';
import fs from 'fs/promises';

export class CompressionController {
  static async compressPDF(req: Request, res: Response): Promise<void> {
    try {
      // Verifica se há arquivo enviado
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Nenhum arquivo PDF foi enviado. Envie um arquivo PDF para compressão'
        });
        return;
      }

      const { path: inputPath, originalname, size: originalSize } = req.file;
      const compressionLevel = (req.body.level || 'medium') as 'low' | 'medium' | 'high';

      // Valida nível de compressão
      const validLevels = ['low', 'medium', 'high'];
      if (!validLevels.includes(compressionLevel)) {
        await FileConverter.cleanupFile(inputPath);
        res.status(400).json({
          success: false,
          error: `Nível de compressão inválido. Use: ${validLevels.join(', ')}`
        });
        return;
      }

      console.log(`Iniciando compressão de PDF: ${originalname} (${(originalSize / 1024).toFixed(2)} KB)`);

      // Processa compressão
      const result = await FileConverter.compressPDF(inputPath, undefined, compressionLevel);

      // Limpa o arquivo de entrada
      await FileConverter.cleanupFile(inputPath);

      if (result.success && result.outputPath) {
        // Calcula estatísticas
        const savedBytes = (result.originalSize || 0) - (result.compressedSize || 0);
        const savedKB = (savedBytes / 1024).toFixed(2);
        const savedMB = (savedBytes / (1024 * 1024)).toFixed(2);

        // Lê o arquivo comprimido para enviar
        const compressedFileBuffer = await fs.readFile(result.outputPath);

        // Define nome do arquivo de saída
        const parsedName = path.parse(originalname);
        const outputFilename = `${parsedName.name}_compressed.pdf`;

        // Configura headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
        res.setHeader('Content-Length', compressedFileBuffer.length);

        // Adiciona headers customizados com estatísticas
        res.setHeader('X-Original-Size', result.originalSize?.toString() || '0');
        res.setHeader('X-Compressed-Size', result.compressedSize?.toString() || '0');
        res.setHeader('X-Compression-Ratio', result.compressionRatio?.toString() || '0');
        res.setHeader('X-Saved-Bytes', savedBytes.toString());

        // Limpa o arquivo comprimido após um pequeno delay
        setTimeout(async () => {
          try {
            await FileConverter.cleanupFile(result.outputPath!);
          } catch (cleanupError) {
            console.warn('Erro ao limpar arquivo comprimido:', cleanupError);
          }
        }, 1000);

        console.log(`Compressão concluída: ${savedKB} KB salvos (${result.compressionRatio}% de redução)`);

        // Envia o arquivo
        res.send(compressedFileBuffer);
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Erro ao comprimir PDF'
        });
      }
    } catch (error) {
      console.error('Erro na compressão de PDF:', error);
      
      // Tenta limpar arquivo se existir
      if (req.file?.path) {
        try {
          await FileConverter.cleanupFile(req.file.path);
        } catch (cleanupError) {
          console.warn('Erro ao limpar arquivo após falha:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  static async getCompressionInfo(req: Request, res: Response): Promise<void> {
    try {
      const compressionInfo = {
        levels: {
          low: {
            name: 'Baixa',
            description: 'Compressão leve, mantém mais qualidade',
            reduction: '10-20%',
            speed: 'Rápida'
          },
          medium: {
            name: 'Média',
            description: 'Balance entre qualidade e tamanho',
            reduction: '20-40%',
            speed: 'Normal'
          },
          high: {
            name: 'Alta',
            description: 'Máxima compressão, pode afetar qualidade',
            reduction: '40-60%',
            speed: 'Lenta'
          }
        },
        limits: {
          maxFileSize: '50MB',
          supportedFormat: 'PDF apenas',
          outputFormat: 'PDF'
        },
        tips: [
          'PDFs com muitas imagens têm maior potencial de compressão',
          'Documentos já otimizados podem ter pouca redução adicional',
          'A compressão alta pode afetar a qualidade de imagens no PDF',
          'Teste diferentes níveis para encontrar o balance ideal'
        ]
      };

      res.json({
        success: true,
        data: compressionInfo
      });
    } catch (error) {
      console.error('Erro ao obter informações de compressão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter informações de compressão'
      });
    }
  }
}
