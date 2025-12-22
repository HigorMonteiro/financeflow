import { Request, Response } from 'express';
import { ExcelImportService } from '../services/excel-import.service';
import { CSVImportService } from '../services/csv-import.service';
import { CardDetectionService } from '../services/card-detection.service';
import { AppError } from '../middlewares/error.middleware';

const excelImportService = new ExcelImportService();
const csvImportService = new CSVImportService();
const cardDetectionService = new CardDetectionService();

export class ImportController {
  async importExcel(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      throw new AppError(400, 'Arquivo não fornecido');
    }

    const fileBuffer = req.file.buffer;
    const result = await excelImportService.importFromExcel(req.userId, fileBuffer);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json({
      message: 'Importação concluída com sucesso',
      ...result,
    });
  }

  async importCSV(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        throw new AppError(400, 'Arquivo não fornecido');
      }

      // Tentar diferentes encodings
      let csvContent: string;
      try {
        csvContent = req.file.buffer.toString('utf-8');
      } catch (error) {
        try {
          csvContent = req.file.buffer.toString('latin1');
        } catch (error2) {
          throw new AppError(400, 'Não foi possível ler o arquivo. Verifique o encoding (UTF-8 recomendado).');
        }
      }
      
      if (!csvContent || csvContent.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Arquivo CSV vazio',
          imported: { categories: 0, accounts: 0, transactions: 0 },
          errors: ['O arquivo CSV está vazio'],
        });
        return;
      }

      // Multer parseia campos de texto também quando usado com .single()
      // O cardId vem no req.body se foi enviado no FormData
      const cardId = (req.body?.cardId && req.body.cardId !== '') ? req.body.cardId : null;
      const result = await csvImportService.importFromCSV(req.userId, csvContent, cardId);

      if (!result.success && result.imported.transactions === 0) {
        res.status(400).json({
          ...result,
          error: result.errors[0] || 'Erro ao processar o arquivo',
        });
        return;
      }

      res.json({
        message: 'Importação concluída com sucesso',
        ...result,
      });
    } catch (error: any) {
      console.error('Erro na importação CSV:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao processar o arquivo',
        imported: { categories: 0, accounts: 0, transactions: 0 },
        errors: [error.message || 'Erro desconhecido'],
      });
    }
  }

  async detectBank(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Arquivo não fornecido' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const lines = csvContent.split('\n').filter((line) => line.trim());
    
    if (lines.length < 2) {
      res.status(400).json({ error: 'CSV vazio ou sem dados' });
      return;
    }

    const delimiter = csvContent.includes(';') ? ';' : ',';
    const headerLine = lines[0];
    const headers = headerLine.split(delimiter).map((h) => h.trim().toLowerCase());
    const sampleLines = lines.slice(1, Math.min(6, lines.length));

    const detection = cardDetectionService.detectBankFromCSV(headers, sampleLines);
    res.json(detection);
  }
}
