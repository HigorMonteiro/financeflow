import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budget.validator';

const router = Router();
const budgetController = new BudgetController();

router.get('/', authMiddleware, (req, res) => {
  budgetController.getAll(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  budgetController.getById(req, res);
});

router.post('/', authMiddleware, validate(createBudgetSchema), (req, res) => {
  budgetController.create(req, res);
});

router.put('/:id', authMiddleware, validate(updateBudgetSchema), (req, res) => {
  budgetController.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  budgetController.delete(req, res);
});

export default router;

