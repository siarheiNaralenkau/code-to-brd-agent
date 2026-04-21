import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { estimateTokens } from '../utils/token-estimate.utils';
import {
  FEATURE_EXTRACTION_SYSTEM_PROMPT,
  buildFeatureExtractionUserPrompt,
} from '../prompts/feature-extraction.prompt';
import {
  BRD_GENERATION_SYSTEM_PROMPT,
  buildBrdGenerationUserPrompt,
} from '../prompts/brd-generation.prompt';
import { LlmResult } from '../types';

export class LlmService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, timeout: env.LLM_REQUEST_TIMEOUT_SECONDS * 1000 });
  }

  async extractFeatureRequirements(astSummary: string, model: string): Promise<LlmResult> {
    logger.log(`[llm] Extracting feature requirements with model ${model}...`);
    logger.log(`[llm] astSummary input tokens (estimated): ${estimateTokens(astSummary)}`);
    const response = await this.client.beta.messages.create({
      model,
      max_tokens: env.LLM_MAX_OUTPUT_TOKENS,
      betas: ['prompt-caching-2024-07-31'],
      system: [
        {
          type: 'text',
          text: FEATURE_EXTRACTION_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: buildFeatureExtractionUserPrompt(astSummary),
        },
      ],
    });

    return {
      text: this.extractText(response.content),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: response.usage.cache_read_input_tokens ?? 0,
      },
    };
  }

  async generateBrd(
    featureRequirements: string,
    astSummary: string,
    model: string,
  ): Promise<LlmResult> {
    logger.log(`[llm] Generating BRD with model ${model}...`);
    logger.log(`[llm] featureRequirements input tokens (estimated): ${estimateTokens(featureRequirements)}`);
    logger.log(`[llm] astSummary input tokens (estimated): ${estimateTokens(astSummary)}`);
    const response = await this.client.beta.messages.create({
      model,
      max_tokens: env.LLM_MAX_OUTPUT_TOKENS,
      betas: ['prompt-caching-2024-07-31'],
      system: [
        {
          type: 'text',
          text: BRD_GENERATION_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: buildBrdGenerationUserPrompt(featureRequirements, astSummary),
        },
      ],
    });

    return {
      text: this.extractText(response.content),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: response.usage.cache_read_input_tokens ?? 0,
      },
    };
  }

  private extractText(content: Anthropic.Beta.Messages.BetaContentBlock[]): string {
    const textBlock = content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('LLM returned no text content');
    }
    return textBlock.text;
  }
}
