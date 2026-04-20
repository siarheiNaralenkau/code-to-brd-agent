import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import {
  FEATURE_EXTRACTION_SYSTEM_PROMPT,
  buildFeatureExtractionUserPrompt,
} from '../prompts/feature-extraction.prompt';
import {
  BRD_GENERATION_SYSTEM_PROMPT,
  buildBrdGenerationUserPrompt,
} from '../prompts/brd-generation.prompt';

export class LlmService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async extractFeatureRequirements(astSummary: string, model: string): Promise<string> {
    logger.log(`[llm] Extracting feature requirements with model ${model}...`);
    // Use beta.messages for prompt caching support
    const response = await this.client.beta.messages.create({
      model,
      max_tokens: 8192,
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

    return this.extractText(response.content);
  }

  async generateBrd(
    featureRequirements: string,
    astSummary: string,
    model: string,
  ): Promise<string> {
    logger.log(`[llm] Generating BRD with model ${model}...`);
    const response = await this.client.beta.messages.create({
      model,
      max_tokens: 16000,
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

    return this.extractText(response.content);
  }

  private extractText(content: Anthropic.Beta.Messages.BetaContentBlock[]): string {
    const textBlock = content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('LLM returned no text content');
    }
    return textBlock.text;
  }
}
