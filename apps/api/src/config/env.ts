import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().default('file:./dev.db'),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('10485760'), // 10MB
  ALLOWED_FILE_TYPES: z.string().default('.csv,.xlsx,.xls'),
  
  // CORS
  CORS_ORIGIN: z.string().url().optional(),
  CORS_CREDENTIALS: z.string().default('true'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_ERRORS: z.string().default('true'),
  
  // Seed (opcional)
  SEED_EMAIL: z.string().email().optional(),
  SEED_PASSWORD: z.string().optional(),
  SEED_NAME: z.string().optional(),
  
  // Rate Limiting (opcional)
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Missing or invalid environment variables:\n${missingVars}`);
    }
    throw error;
  }
}

export const env = validateEnv();

