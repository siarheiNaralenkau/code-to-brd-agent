import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from project root (one level above backend/)
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

const EnvSchema = z
  .object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LLM_TYPE: z.enum(['Claude', 'SAP']).default('Claude'),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-5'),
    SAP_LLM_ENDPOINT_URL: z.string().optional(),
    SAP_LLM_FOUNDATION_MODEL_TO_USE: z.string().optional(),
    SAP_LLM_DEPLOYMENT_ID: z.string().optional(),
    SAP_LLM_AUTH_URL: z.string().optional(),
    SAP_LLM_AUTH_CLIENT_ID: z.string().optional(),
    SAP_LLM_AUTH_CLIENT_SECRET: z.string().optional(),
    SAP_LLM_ANTHROPIC_VERSION: z.string().optional(),
    LLM_MAX_OUTPUT_TOKENS: z.coerce.number().default(16000),
    LLM_REQUEST_TIMEOUT_SECONDS: z.coerce.number().default(600),
    REPOS_ROOT: z.string().default('./data/repos'),
    OUTPUT_ROOT: z.string().default('./data/outputs'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    GITHUB_TOKEN: z.string().optional(),
  })
  .refine((data) => data.LLM_TYPE !== 'Claude' || !!data.ANTHROPIC_API_KEY, {
    message: 'ANTHROPIC_API_KEY is required when LLM_TYPE=Claude',
    path: ['ANTHROPIC_API_KEY'],
  })
  .refine(
    (data) =>
      data.LLM_TYPE !== 'SAP' ||
      (!!data.SAP_LLM_ENDPOINT_URL &&
        !!data.SAP_LLM_FOUNDATION_MODEL_TO_USE &&
        !!data.SAP_LLM_DEPLOYMENT_ID &&
        !!data.SAP_LLM_AUTH_URL &&
        !!data.SAP_LLM_AUTH_CLIENT_ID &&
        !!data.SAP_LLM_AUTH_CLIENT_SECRET &&
        !!data.SAP_LLM_ANTHROPIC_VERSION),
    {
      message:
        'SAP_LLM_ENDPOINT_URL, SAP_LLM_FOUNDATION_MODEL_TO_USE, SAP_LLM_DEPLOYMENT_ID, SAP_LLM_AUTH_URL, SAP_LLM_AUTH_CLIENT_ID, SAP_LLM_AUTH_CLIENT_SECRET, SAP_LLM_ANTHROPIC_VERSION are all required when LLM_TYPE=SAP',
      path: ['SAP_LLM_ENDPOINT_URL'],
    },
  );

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const ts = () => new Date().toTimeString().slice(0, 8);
  console.error(`[${ts()}] [env] Invalid environment configuration:`);
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
