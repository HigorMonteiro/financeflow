import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getDashboard(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = await analyticsService.getDashboardData(req.userId);
    res.json(data);
  }

  async getTrends(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    const period = (req.query.period as 'day' | 'week' | 'month') || 'month';

    const data = await analyticsService.getTrends(req.userId, startDate, endDate, period);
    res.json(data);
  }

  async getCashFlow(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const months = req.query.months ? parseInt(req.query.months as string) : 6;
    const data = await analyticsService.getCashFlow(req.userId, months);
    res.json(data);
  }

  async getCategoryAnalysis(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    const type = (req.query.type as 'INCOME' | 'EXPENSE') || 'EXPENSE';

    const data = await analyticsService.getCategoryAnalysis(req.userId, startDate, endDate, type);
    res.json(data);
  }

  async getPeriodComparison(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';
    const data = await analyticsService.getPeriodComparison(req.userId, period);
    res.json(data);
  }
}

