import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

export class CategoryController {
  async getAll(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const categories = await categoryService.getAll(req.userId);
    res.json(categories);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const category = await categoryService.getById(req.userId, req.params.id);
    res.json(category);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const category = await categoryService.create(req.userId, req.body);
    res.status(201).json(category);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const category = await categoryService.update(req.userId, req.params.id, req.body);
    res.json(category);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await categoryService.delete(req.userId, req.params.id);
    res.status(204).send();
  }
}

