import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const cardController = new CardController();

router.get('/', authMiddleware, (req, res) => {
  cardController.getAll(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  cardController.getById(req, res);
});

router.post('/', authMiddleware, (req, res) => {
  cardController.create(req, res);
});

router.put('/:id', authMiddleware, (req, res) => {
  cardController.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  cardController.delete(req, res);
});

export default router;

