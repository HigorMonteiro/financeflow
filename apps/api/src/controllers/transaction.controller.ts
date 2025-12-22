import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

const transactionService = new TransactionService();

export class TransactionController {
  async getAll(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const filters: any = { ...req.query };
    
    if (filters.page) {
      filters.page = parseInt(filters.page as string) || 1;
    }
    
    if (filters.limit) {
      filters.limit = parseInt(filters.limit as string) || 50;
    }

    const result = await transactionService.getAll(req.userId, filters);
    res.json(result);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const transaction = await transactionService.getById(req.userId, req.params.id);
    res.json(transaction);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const transaction = await transactionService.create(req.userId, req.body);
    res.status(201).json(transaction);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const transaction = await transactionService.update(
      req.userId,
      req.params.id,
      req.body
    );
    res.json(transaction);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await transactionService.delete(req.userId, req.params.id);
    res.status(204).send();
  }
}

