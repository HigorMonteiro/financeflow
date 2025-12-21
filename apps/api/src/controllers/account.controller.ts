import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';

const accountService = new AccountService();

export class AccountController {
  async getAll(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const accounts = await accountService.getAll(req.userId);
    res.json(accounts);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const account = await accountService.getById(req.userId, req.params.id);
    res.json(account);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const account = await accountService.create(req.userId, req.body);
    res.status(201).json(account);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const account = await accountService.update(req.userId, req.params.id, req.body);
    res.json(account);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await accountService.delete(req.userId, req.params.id);
    res.status(204).send();
  }
}

