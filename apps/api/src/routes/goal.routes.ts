import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createGoalSchema, updateGoalSchema } from '../validators/goal.validator';

const router = Router();
const goalController = new GoalController();

router.get('/', authMiddleware, (req, res) => {
  goalController.getAll(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  goalController.getById(req, res);
});

router.post('/', authMiddleware, validate(createGoalSchema), (req, res) => {
  goalController.create(req, res);
});

router.put('/:id', authMiddleware, validate(updateGoalSchema), (req, res) => {
  goalController.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  goalController.delete(req, res);
});

export default router;

