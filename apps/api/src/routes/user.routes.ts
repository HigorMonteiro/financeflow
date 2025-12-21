import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.put('/', authMiddleware, (req, res) => {
  userController.update(req, res);
});

export default router;

