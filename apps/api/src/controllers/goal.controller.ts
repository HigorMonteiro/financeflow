import { Request, Response } from 'express';
import { GoalService } from '../services/goal.service';

const goalService = new GoalService();

export class GoalController {
  async getAll(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const goals = await goalService.getAll(req.userId);
    res.json(goals);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const goal = await goalService.getById(req.userId, req.params.id);
    res.json(goal);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const goal = await goalService.create(req.userId, req.body);
    res.status(201).json(goal);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const goal = await goalService.update(req.userId, req.params.id, req.body);
    res.json(goal);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await goalService.delete(req.userId, req.params.id);
    res.status(204).send();
  }
}

