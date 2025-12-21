import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const transactionController = new TransactionController();

router.get('/', authMiddleware, (req, res) => {
  transactionController.getAll(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  transactionController.getById(req, res);
});

router.post('/', authMiddleware, (req, res) => {
  transactionController.create(req, res);
});

router.put('/:id', authMiddleware, (req, res) => {
  transactionController.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  transactionController.delete(req, res);
});

export default router;

