import { Request, Response } from 'express';
import { BudgetService } from '../services/budget.service';

const budgetService = new BudgetService();

export class BudgetController {
  async getAll(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const filters: any = {};
    if (req.query.page) {
      filters.page = parseInt(req.query.page as string) || 1;
    }
    if (req.query.limit) {
      filters.limit = parseInt(req.query.limit as string) || 50;
    }

    const result = await budgetService.getAll(req.userId, filters);
    res.json(result);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const budget = await budgetService.getById(req.userId, req.params.id);
    res.json(budget);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const budget = await budgetService.create(req.userId, req.body);
    res.status(201).json(budget);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const budget = await budgetService.update(req.userId, req.params.id, req.body);
    res.json(budget);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await budgetService.delete(req.userId, req.params.id);
    res.status(204).send();
  }
}

