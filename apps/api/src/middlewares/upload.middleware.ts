import multer from 'multer';
import { Request } from 'express';
import { env } from '../config/env';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'text/plain', // .csv (alguns sistemas)
    'application/csv', // .csv (alguns sistemas)
  ];

  const allowedTypes = env.ALLOWED_FILE_TYPES.split(',').map((t) => t.trim());
  const fileExtension = '.' + file.originalname.split('.').pop()?.toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não suportado. Tipos permitidos: ${allowedTypes.join(', ')}`));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(env.MAX_FILE_SIZE, 10),
  },
});

