import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const accountController = new AccountController();

router.get('/', authMiddleware, (req, res) => {
  accountController.getAll(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  accountController.getById(req, res);
});

router.post('/', authMiddleware, (req, res) => {
  accountController.create(req, res);
});

router.put('/:id', authMiddleware, (req, res) => {
  accountController.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  accountController.delete(req, res);
});

export default router;

