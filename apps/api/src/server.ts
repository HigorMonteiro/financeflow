import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN || env.FRONTEND_URL,
  credentials: env.CORS_CREDENTIALS === 'true',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);

async function startServer() {
  await connectDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

