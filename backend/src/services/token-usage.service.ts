import { RawTokenUsage, TokenUsageSummary } from '../types';

// Claude Sonnet 4.6 pricing (USD per million tokens)
const SONNET_4_6_PRICING = {
  inputPerMillion: 3.0,
  outputPerMillion: 15.0,
  cacheWritePerMillion: 3.75,
  cacheReadPerMillion: 0.3,
};

export class TokenUsageService {
  calculateCost(usage: RawTokenUsage): TokenUsageSummary {
    const inputCost = (usage.inputTokens / 1_000_000) * SONNET_4_6_PRICING.inputPerMillion;
    const outputCost = (usage.outputTokens / 1_000_000) * SONNET_4_6_PRICING.outputPerMillion;
    const cacheWriteCost =
      (usage.cacheCreationInputTokens / 1_000_000) * SONNET_4_6_PRICING.cacheWritePerMillion;
    const cacheReadCost =
      (usage.cacheReadInputTokens / 1_000_000) * SONNET_4_6_PRICING.cacheReadPerMillion;

    return {
      ...usage,
      totalCost: inputCost + outputCost + cacheWriteCost + cacheReadCost,
    };
  }
}

export const tokenUsageService = new TokenUsageService();
