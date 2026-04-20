import { env } from '../config/env';
import { LlmService } from './llm.service';
import { SapLlmService } from './sap.llm.service';

export const llmService =
  env.LLM_TYPE === 'SAP'
    ? new SapLlmService({
        SAP_LLM_ENDPOINT_URL: env.SAP_LLM_ENDPOINT_URL!,
        SAP_LLM_FOUNDATION_MODEL_TO_USE: env.SAP_LLM_FOUNDATION_MODEL_TO_USE!,
        SAP_LLM_DEPLOYMENT_ID: env.SAP_LLM_DEPLOYMENT_ID!,
        SAP_LLM_AUTH_URL: env.SAP_LLM_AUTH_URL!,
        SAP_LLM_AUTH_CLIENT_ID: env.SAP_LLM_AUTH_CLIENT_ID!,
        SAP_LLM_AUTH_CLIENT_SECRET: env.SAP_LLM_AUTH_CLIENT_SECRET!,
        SAP_LLM_ANTHROPIC_VERSION: env.SAP_LLM_ANTHROPIC_VERSION!,
      })
    : new LlmService(env.ANTHROPIC_API_KEY!);
