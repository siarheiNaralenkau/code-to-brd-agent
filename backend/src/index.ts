import { env } from './config/env';
import { createApp } from './app';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`[server] Running on http://localhost:${env.PORT}`);
  console.log(`[server] Swagger UI: http://localhost:${env.PORT}/api/docs`);
  console.log(`[server] Environment: ${env.NODE_ENV}`);
});
