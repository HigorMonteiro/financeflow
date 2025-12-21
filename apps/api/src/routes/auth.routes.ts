import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), (req, res) => {
  authController.register(req, res);
});

router.post('/login', validate(loginSchema), (req, res) => {
  authController.login(req, res);
});

router.get('/me', authMiddleware, (req, res) => {
  authController.me(req, res);
});

export default router;

