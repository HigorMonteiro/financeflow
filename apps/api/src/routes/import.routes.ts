import { Router } from 'express';
import { ImportController } from '../controllers/import.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();
const importController = new ImportController();

router.post(
  '/excel',
  authMiddleware,
  uploadMiddleware.single('file'),
  (req, res) => {
    importController.importExcel(req, res);
  }
);

router.post(
  '/csv',
  authMiddleware,
  uploadMiddleware.single('file'),
  (req, res) => {
    importController.importCSV(req, res);
  }
);

router.post(
  '/detect-bank',
  authMiddleware,
  uploadMiddleware.single('file'),
  (req, res) => {
    importController.detectBank(req, res);
  }
);

export default router;

