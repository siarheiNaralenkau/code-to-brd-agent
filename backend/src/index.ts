import { env } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';

const app = createApp();

app.listen(env.PORT, () => {
  logger.log(`[server] Running on http://localhost:${env.PORT}`);
  logger.log(`[server] Swagger UI: http://localhost:${env.PORT}/api/docs`);
  logger.log(`[server] Environment: ${env.NODE_ENV}`);
});
