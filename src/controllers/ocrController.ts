import type { Request, Response } from 'express';
import { FileConverter } from '../core/converter.js';
import fs from 'fs/promises';

export class OCRController {
  static async extractText(req: Request, res: Response): Promise<void> {
    try {
      // Verifica se há arquivo enviado
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Nenhuma imagem foi enviada. Envie uma imagem (JPG, PNG, BMP, TIFF, WEBP)'
        });
        return;
      }

      const { path: imagePath, originalname } = req.file;
      const language = (req.body.language || 'eng') as string;

      console.log(`Iniciando OCR para: ${originalname}`);

      // Processa OCR
      const result = await FileConverter.performOCR(imagePath, language);

      // Limpa o arquivo temporário
      await FileConverter.cleanupFile(imagePath);

      if (result.success) {
        res.json({
          success: true,
          data: {
            text: result.text,
            confidence: result.confidence,
            filename: originalname,
            language: language
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Erro ao processar OCR'
        });
      }
    } catch (error) {
      console.error('Erro no OCR:', error);
      
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

  static async getLanguages(req: Request, res: Response): Promise<void> {
    try {
      const supportedLanguages = {
        'afr': 'Africâner',
        'amh': 'Amárico',
        'ara': 'Árabe',
        'asm': 'Assamês',
        'aze': 'Azerbaijano',
        'aze_cyrl': 'Azerbaijano (Cirílico)',
        'bel': 'Bielorrusso',
        'ben': 'Bengali',
        'bod': 'Tibetano',
        'bos': 'Bósnio',
        'bre': 'Bretão',
        'bul': 'Búlgaro',
        'cat': 'Catalão',
        'ceb': 'Cebuano',
        'ces': 'Tcheco',
        'chi_sim': 'Chinês Simplificado',
        'chi_tra': 'Chinês Tradicional',
        'chr': 'Cherokee',
        'cym': 'Galês',
        'dan': 'Dinamarquês',
        'deu': 'Alemão',
        'dzo': 'Dzongkha',
        'ell': 'Grego',
        'eng': 'Inglês',
        'enm': 'Inglês Médio',
        'epo': 'Esperanto',
        'est': 'Estoniano',
        'eus': 'Basco',
        'fas': 'Persa',
        'fin': 'Finlandês',
        'fra': 'Francês',
        'frk': 'Franco',
        'frm': 'Francês Médio',
        'gle': 'Irlandês',
        'glg': 'Galego',
        'grc': 'Grego Antigo',
        'guj': 'Gujarati',
        'hat': 'Haitiano',
        'heb': 'Hebraico',
        'hin': 'Hindi',
        'hrv': 'Croata',
        'hun': 'Húngaro',
        'iku': 'Inuktitut',
        'ind': 'Indonésio',
        'isl': 'Islandês',
        'ita': 'Italiano',
        'ita_old': 'Italiano Antigo',
        'jav': 'Javanês',
        'jpn': 'Japonês',
        'kan': 'Canarês',
        'kat': 'Georgiano',
        'kat_old': 'Georgiano Antigo',
        'kaz': 'Cazaque',
        'khm': 'Khmer',
        'kir': 'Quirguiz',
        'kor': 'Coreano',
        'kur': 'Curdo',
        'lao': 'Lao',
        'lat': 'Latim',
        'lav': 'Letão',
        'lit': 'Lituano',
        'ltz': 'Luxemburguês',
        'mal': 'Malayalam',
        'mar': 'Marathi',
        'mkd': 'Macedônio',
        'mlt': 'Maltês',
        'mon': 'Mongol',
        'mri': 'Maori',
        'msa': 'Malaio',
        'mya': 'Birmanês',
        'nep': 'Nepalês',
        'nld': 'Holandês',
        'nor': 'Norueguês',
        'oci': 'Occitano',
        'ori': 'Odia',
        'pan': 'Punjabi',
        'pol': 'Polonês',
        'por': 'Português',
        'pus': 'Pashto',
        'que': 'Quéchua',
        'ron': 'Romeno',
        'rus': 'Russo',
        'san': 'Sânscrito',
        'sin': 'Cingalês',
        'slk': 'Eslovaco',
        'slv': 'Esloveno',
        'snd': 'Sindhi',
        'spa': 'Espanhol',
        'spa_old': 'Espanhol Antigo',
        'sqi': 'Albanês',
        'srp': 'Sérvio',
        'srp_latn': 'Sérvio (Latino)',
        'sun': 'Sundanês',
        'swa': 'Suaíli',
        'swe': 'Sueco',
        'syr': 'Siríaco',
        'tam': 'Tâmil',
        'tat': 'Tártaro',
        'tel': 'Telugu',
        'tgk': 'Tadjique',
        'tgl': 'Tagalo',
        'tha': 'Tailandês',
        'tir': 'Tigrínia',
        'ton': 'Tonga',
        'tur': 'Turco',
        'uig': 'Uigur',
        'ukr': 'Ucraniano',
        'urd': 'Urdu',
        'uzb': 'Uzbeque',
        'uzb_cyrl': 'Uzbeque (Cirílico)',
        'vie': 'Vietnamita',
        'yid': 'Iídiche',
        'yor': 'Iorubá'
      };

      res.json({
        success: true,
        data: {
          languages: supportedLanguages,
          default: 'eng',
          popular: ['eng', 'por', 'spa', 'fra', 'deu', 'ita', 'rus', 'chi_sim', 'jpn', 'kor']
        }
      });
    } catch (error) {
      console.error('Erro ao obter idiomas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter lista de idiomas suportados'
      });
    }
  }
}
