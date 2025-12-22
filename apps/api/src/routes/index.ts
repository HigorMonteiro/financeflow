import { Router } from 'express';
import authRoutes from './auth.routes';
import importRoutes from './import.routes';
import transactionRoutes from './transaction.routes';
import analyticsRoutes from './analytics.routes';
import categoryRoutes from './category.routes';
import accountRoutes from './account.routes';
import userRoutes from './user.routes';
import cardRoutes from './card.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/import', importRoutes);
router.use('/transactions', transactionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/categories', categoryRoutes);
router.use('/accounts', accountRoutes);
router.use('/user', userRoutes);
router.use('/cards', cardRoutes);

export default router;

