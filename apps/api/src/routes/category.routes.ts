import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

router.get('/', authMiddleware, (req, res) => {
  categoryController.getAll(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  categoryController.getById(req, res);
});

router.post('/', authMiddleware, (req, res) => {
  categoryController.create(req, res);
});

router.put('/:id', authMiddleware, (req, res) => {
  categoryController.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  categoryController.delete(req, res);
});

export default router;

