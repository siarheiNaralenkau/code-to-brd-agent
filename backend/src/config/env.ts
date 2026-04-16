import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from project root (one level above backend/)
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-5'),
  REPOS_ROOT: z.string().default('./data/repos'),
  OUTPUT_ROOT: z.string().default('./data/outputs'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  GITHUB_TOKEN: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
