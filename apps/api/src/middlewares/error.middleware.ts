import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    // Não capturar stack trace para erros operacionais comuns (melhora performance)
    if (statusCode >= 500 || process.env.NODE_ENV === 'development') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    // Erros operacionais (como credenciais inválidas) são esperados e não precisam ser logados como erros
    // Apenas logar em desenvolvimento para debug
    if (process.env.NODE_ENV === 'development') {
      // Log apenas se não for um erro de autenticação comum
      if (err.statusCode !== 401 || err.message !== 'Invalid credentials') {
        console.log(`[${err.statusCode}] ${err.message}`);
      }
    }
    
    res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && err.statusCode >= 500 && { stack: err.stack }),
    });
    return;
  }

  // Erros não esperados devem ser logados
  console.error('Unexpected error:', err);
  
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { message: err.message }),
  });
}

