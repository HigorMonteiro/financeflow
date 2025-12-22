import { Request, Response } from 'express';
import { CardService } from '../services/card.service';

const cardService = new CardService();

export class CardController {
  async getAll(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const cards = await cardService.getAll(req.userId);
    res.json(cards);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const card = await cardService.getById(req.userId, req.params.id);
    res.json(card);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const card = await cardService.create(req.userId, req.body);
    res.status(201).json(card);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const card = await cardService.update(req.userId, req.params.id, req.body);
    res.json(card);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await cardService.delete(req.userId, req.params.id);
    res.status(204).send();
  }
}

