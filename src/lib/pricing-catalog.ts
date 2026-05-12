/**
 * Reference USD pricing for UI copy — mirrors audit-engine benchmarks.
 * All amounts are illustrative public list prices as of submission week (May 2026).
 */

export const PRICING_REFERENCE_LABEL = "May 2026 (USD benchmarks)";

export const API_PRICE_PER_MILLION_TOKENS_USD: Record<
  string,
  { label: string; inputUsd: number; outputUsd: number }
> = {
  api_anthropic_sonnet: {
    label: "Anthropic · Claude Sonnet-class",
    inputUsd: 3,
    outputUsd: 15,
  },
  api_anthropic_haiku: {
    label: "Anthropic · Claude Haiku-class",
    inputUsd: 0.8,
    outputUsd: 4,
  },
  api_openai_gpt5_4: {
    label: "OpenAI · GPT-5.x–class frontier",
    inputUsd: 2.5,
    outputUsd: 15,
  },
  api_openai_4o_mini: {
    label: "OpenAI · GPT-4o-mini",
    inputUsd: 0.15,
    outputUsd: 0.6,
  },
  api_gemini_3_pro: {
    label: "Google · Gemini Pro–class API",
    inputUsd: 1.25,
    outputUsd: 10,
  },
  api_gemini_flash: {
    label: "Google · Gemini Flash-class API",
    inputUsd: 0.075,
    outputUsd: 0.3,
  },
};

export function apiPriceFootnote(toolSlug: string): string | null {
  const p = API_PRICE_PER_MILLION_TOKENS_USD[toolSlug];
  if (!p) return null;
  return `${p.label}: $${p.inputUsd}/1M in · $${p.outputUsd}/1M out (${PRICING_REFERENCE_LABEL}).`;
}
