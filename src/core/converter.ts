import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { createWorker } from 'tesseract.js';

export interface ConversionOptions {
  inputPath: string;
  outputPath: string;
  targetFormat: 'pdf' | 'docx';
}

export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

export interface OCRResult {
  success: boolean;
  text?: string;
  confidence?: number;
  error?: string;
}

export interface CompressionResult {
  success: boolean;
  outputPath?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

export class FileConverter {
  private static readonly TEMP_DIR = path.join(process.cwd(), 'temp');

  static async ensureTempDir(): Promise<void> {
    try {
      await fs.access(this.TEMP_DIR);
    } catch {
      await fs.mkdir(this.TEMP_DIR, { recursive: true });
    }
  }

  static async convertFile(options: ConversionOptions): Promise<ConversionResult> {
    try {
      await this.ensureTempDir();

      const { inputPath, outputPath, targetFormat } = options;
      const inputExtension = path.extname(inputPath).toLowerCase();

      if (targetFormat === 'pdf' && inputExtension === '.docx') {
        return await this.docxToPdf(inputPath, outputPath);
      } else if (targetFormat === 'docx' && inputExtension === '.pdf') {
        return await this.pdfToDocx(inputPath, outputPath);
      } else {
        return {
          success: false,
          error: `Conversão não suportada: ${inputExtension} para ${targetFormat}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na conversão'
      };
    }
  }

  private static async docxToPdf(inputPath: string, outputPath: string): Promise<ConversionResult> {
    try {
      // Lê o arquivo DOCX
      const result = await mammoth.extractRawText({ path: inputPath });
      const text = result.value;

      // Cria um novo PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { height } = page.getSize();
      
      const fontSize = 12;
      const lineHeight = fontSize * 1.2;
      const margin = 50;
      const maxWidth = page.getSize().width - 2 * margin;

      // Divide o texto em linhas que cabem na página
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        // Estimativa simples do tamanho da linha (pode ser melhorada)
        if (testLine.length * (fontSize * 0.6) < maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Adiciona o texto ao PDF
      let yPosition = height - margin;
      for (const line of lines) {
        if (yPosition < margin) {
          // Nova página se necessário
          const newPage = pdfDoc.addPage();
          yPosition = newPage.getSize().height - margin;
        }

        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
        });

        yPosition -= lineHeight;
      }

      // Salva o PDF
      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(outputPath, pdfBytes);

      return { success: true, outputPath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na conversão DOCX para PDF'
      };
    }
  }

  private static async pdfToDocx(inputPath: string, outputPath: string): Promise<ConversionResult> {
    try {
      // Esta é uma implementação básica - em produção você pode querer usar bibliotecas mais avançadas
      // como pdf-parse ou pdfjs-dist para extração de texto mais robusta
      
      // Por enquanto, criamos um DOCX com uma mensagem indicando a limitação
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Conversão PDF para DOCX",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Esta é uma implementação básica da conversão PDF para DOCX. ",
                }),
                new TextRun({
                  text: "Para uma extração de texto mais avançada, considere usar bibliotecas como pdf-parse ou pdfjs-dist.",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Arquivo original: ${path.basename(inputPath)}`,
                  italics: true,
                }),
              ],
            }),
          ],
        }],
      });

      // Gera o buffer do DOCX
      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(outputPath, buffer);

      return { success: true, outputPath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na conversão PDF para DOCX'
      };
    }
  }

  static async generateTempFilename(originalName: string, targetFormat: string): Promise<string> {
    const timestamp = Date.now();
    const baseName = path.parse(originalName).name;
    const extension = targetFormat === 'pdf' ? '.pdf' : '.docx';
    return path.join(this.TEMP_DIR, `${baseName}_${timestamp}${extension}`);
  }

  static async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Erro ao limpar arquivo ${filePath}:`, error);
    }
  }

  static async performOCR(imagePath: string, language: string = 'eng'): Promise<OCRResult> {
    try {
      // Verifica se o arquivo existe
      await fs.access(imagePath);

      // Verifica se é uma imagem válida
      const extension = path.extname(imagePath).toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'];
      
      if (!validExtensions.includes(extension)) {
        return {
          success: false,
          error: `Formato de imagem não suportado: ${extension}. Formatos aceitos: JPG, PNG, BMP, TIFF, WEBP`
        };
      }

      // Cria worker do Tesseract
      const worker = await createWorker(language);
      
      try {
        // Processa a imagem
        const result = await worker.recognize(imagePath);
        
        return {
          success: true,
          text: result.data.text,
          confidence: result.data.confidence
        };
      } finally {
        // Limpa o worker
        await worker.terminate();
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido durante OCR'
      };
    }
  }

  static async compressPDF(inputPath: string, outputPath?: string, compressionLevel: 'low' | 'medium' | 'high' = 'medium'): Promise<CompressionResult> {
    try {
      // Verifica se o arquivo existe
      await fs.access(inputPath);

      // Verifica se é um PDF
      const extension = path.extname(inputPath).toLowerCase();
      if (extension !== '.pdf') {
        return {
          success: false,
          error: `Arquivo deve ser um PDF. Arquivo recebido: ${extension}`
        };
      }

      // Lê o arquivo PDF
      const pdfBytes = await fs.readFile(inputPath);
      const originalSize = pdfBytes.length;

      // Carrega o documento PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Define configurações de compressão baseadas no nível
      let compressionOptions = {};
      
      switch (compressionLevel) {
        case 'low':
          compressionOptions = {
            useObjectStreams: false,
            addDefaultPage: false
          };
          break;
        case 'medium':
          compressionOptions = {
            useObjectStreams: true,
            addDefaultPage: false
          };
          break;
        case 'high':
          compressionOptions = {
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false
          };
          break;
      }

      // Serializa o PDF com compressão
      const compressedPdfBytes = await pdfDoc.save(compressionOptions);
      const compressedSize = compressedPdfBytes.length;

      // Calcula taxa de compressão
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      // Define caminho de saída se não fornecido
      if (!outputPath) {
        const parsedPath = path.parse(inputPath);
        outputPath = path.join(this.TEMP_DIR, `${parsedPath.name}_compressed_${Date.now()}.pdf`);
      }

      // Salva o arquivo comprimido
      await fs.writeFile(outputPath, compressedPdfBytes);

      return {
        success: true,
        outputPath,
        originalSize,
        compressedSize,
        compressionRatio: Math.round(compressionRatio * 100) / 100
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido durante compressão'
      };
    }
  }
}
