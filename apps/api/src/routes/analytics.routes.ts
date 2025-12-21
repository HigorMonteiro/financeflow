import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/dashboard', authMiddleware, (req, res) => {
  analyticsController.getDashboard(req, res);
});

router.get('/trends', authMiddleware, (req, res) => {
  analyticsController.getTrends(req, res);
});

router.get('/cash-flow', authMiddleware, (req, res) => {
  analyticsController.getCashFlow(req, res);
});

router.get('/category-analysis', authMiddleware, (req, res) => {
  analyticsController.getCategoryAnalysis(req, res);
});

router.get('/period-comparison', authMiddleware, (req, res) => {
  analyticsController.getPeriodComparison(req, res);
});

export default router;

