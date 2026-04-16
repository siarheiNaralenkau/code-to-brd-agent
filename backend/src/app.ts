import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';
import { apiRouter } from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { env } from './config/env';

export function createApp() {
  const app = express();

  // --- Middleware ---
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '10mb' }));

  // --- Swagger UI ---
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // --- API Routes ---
  app.use('/api', apiRouter);

  // --- Error handler (must be last) ---
  app.use(errorMiddleware);

  return app;
}
