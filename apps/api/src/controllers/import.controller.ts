import { Request, Response } from 'express';
import { ExcelImportService } from '../services/excel-import.service';
import { CSVImportService } from '../services/csv-import.service';
import { AppError } from '../middlewares/error.middleware';

const excelImportService = new ExcelImportService();
const csvImportService = new CSVImportService();

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

      const csvContent = req.file.buffer.toString('utf-8');
      
      if (!csvContent || csvContent.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Arquivo CSV vazio',
          imported: { categories: 0, accounts: 0, transactions: 0 },
          errors: ['O arquivo CSV está vazio'],
        });
        return;
      }

      const result = await csvImportService.importFromCSV(req.userId, csvContent);

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
}

