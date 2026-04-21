import * as https from 'node:https';
import { URL } from 'node:url';
import { env } from '../config/env';
import {
  FEATURE_EXTRACTION_SYSTEM_PROMPT,
  buildFeatureExtractionUserPrompt,
} from '../prompts/feature-extraction.prompt';
import {
  BRD_GENERATION_SYSTEM_PROMPT,
  buildBrdGenerationUserPrompt,
} from '../prompts/brd-generation.prompt';
import { logger } from '../utils/logger';
import { estimateTokens } from '../utils/token-estimate.utils';
import { LlmResult } from '../types';

interface SapLlmConfig {
  SAP_LLM_ENDPOINT_URL: string;
  SAP_LLM_FOUNDATION_MODEL_TO_USE: string;
  SAP_LLM_DEPLOYMENT_ID: string;
  SAP_LLM_AUTH_URL: string;
  SAP_LLM_AUTH_CLIENT_ID: string;
  SAP_LLM_AUTH_CLIENT_SECRET: string;
  SAP_LLM_ANTHROPIC_VERSION: string;
}

interface TokenCache {
  value: string;
  expiresAt: number;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

interface SapLlmResponse {
  content: AnthropicContentBlock[];
  usage?: AnthropicUsage;
}

export class SapLlmService {
  private cachedToken: TokenCache | null = null;

  constructor(private readonly config: SapLlmConfig) {}

  async extractFeatureRequirements(astSummary: string, _model: string): Promise<LlmResult> {
    logger.log(`[sap-llm] Extracting feature requirements...`);
    logger.log(`[sap-llm] astSummary input tokens (estimated): ${estimateTokens(astSummary)}`);
    return this.callLlm(
      FEATURE_EXTRACTION_SYSTEM_PROMPT,
      buildFeatureExtractionUserPrompt(astSummary),
    );
  }

  async generateBrd(
    featureRequirements: string,
    astSummary: string,
    _model: string,
  ): Promise<LlmResult> {
    logger.log(`[sap-llm] Generating BRD...`);
    logger.log(`[sap-llm] featureRequirements input tokens (estimated): ${estimateTokens(featureRequirements)}`);
    logger.log(`[sap-llm] astSummary input tokens (estimated): ${estimateTokens(astSummary)}`);
    return this.callLlm(
      BRD_GENERATION_SYSTEM_PROMPT,
      buildBrdGenerationUserPrompt(featureRequirements, astSummary),
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      const expiresIn = Math.round((this.cachedToken.expiresAt - Date.now()) / 1000);
      logger.log(`[sap-auth] Reusing cached token (expires in ${expiresIn}s)`);
      return this.cachedToken.value;
    }

    logger.log(`[sap-auth] Fetching new access token...`);
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.SAP_LLM_AUTH_CLIENT_ID,
      client_secret: this.config.SAP_LLM_AUTH_CLIENT_SECRET,
    });

    const response = await fetch(`${this.config.SAP_LLM_AUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SAP auth failed (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in?: number };
    // Default to 3600s if expires_in is missing to avoid NaN cache expiry
    const expiresIn = data.expires_in ?? 3600;
    this.cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + (expiresIn - 60) * 1000,
    };
    const expiresAt = new Date(this.cachedToken.expiresAt).toTimeString().slice(0, 8);
    logger.log(`[sap-auth] Token acquired (expires_in=${expiresIn}s, valid until ${expiresAt})`);
    return this.cachedToken.value;
  }

  private async callLlm(systemPrompt: string, userPrompt: string): Promise<LlmResult> {
    const maxTokens = env.LLM_MAX_OUTPUT_TOKENS;
    const timeoutMs = env.LLM_REQUEST_TIMEOUT_SECONDS * 1000;
    const token = await this.getAccessToken();
    const rawUrl = `${this.config.SAP_LLM_ENDPOINT_URL}/v2/inference/deployments/${this.config.SAP_LLM_DEPLOYMENT_ID}/invoke`;
    const parsedUrl = new URL(rawUrl);
    const body = JSON.stringify({
      anthropic_version: this.config.SAP_LLM_ANTHROPIC_VERSION,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    logger.log(`[sap-llm] Sending request to SAP inference endpoint...`);
    const responseBody = await new Promise<string>((resolve, reject) => {
      const req = https.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk: Buffer) => (data += chunk.toString()));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`SAP LLM request failed (${res.statusCode}): ${data}`));
            } else {
              resolve(data);
            }
          });
        },
      );

      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error(`SAP LLM request timed out after ${timeoutMs / 1000}s`));
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });

    logger.log(`[sap-llm] Response received, parsing content...`);
    const data = JSON.parse(responseBody) as SapLlmResponse;
    const textBlock = data.content?.find((b) => b.type === 'text');
    if (!textBlock?.text) {
      throw new Error('SAP LLM returned no text content');
    }

    return {
      text: textBlock.text,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
        cacheCreationInputTokens: data.usage?.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: data.usage?.cache_read_input_tokens ?? 0,
      },
    };
  }
}
