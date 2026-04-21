/**
 * Claude tokenization approximation: ~4 characters per token.
 * Used to guard against context window overflow before calling the LLM.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
