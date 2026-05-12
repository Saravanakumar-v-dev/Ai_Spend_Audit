/**
 * AI Summary Generator
 */

import type { AuditResult } from "./validators";
import { formatUsd } from "./format-usd";

const SYSTEM_PROMPT = `You are a senior FinOps analyst writing a short executive summary for a startup founder.
Rules:
1. Use ONLY the numbers provided in the JSON — never invent extrapolated savings.
2. Refer to currency strictly as "USD" — never mention rupees or FX.
3. Keep the summary between 80 and 120 words.
4. Professional, confident tone — zero hype or fake urgency.
5. Mention the specific tools where savings were found when applicable.
6. If total savings round to zero, congratulate the founder on a disciplined stack.
7. Never mention emails, company names, or identifiers.`;

function buildUserPrompt(result: AuditResult): string {
  const toolLines = result.toolResults
    .map((t) => {
      const base = `- ${t.toolName} (${t.currentPlan}): modeled ${formatUsd(t.currentMonthlyCost)} USD/mo`;
      if (t.monthlySavings > 0) {
        return `${base}, potential ${formatUsd(t.monthlySavings)} USD/mo via ${t.recommendedPlan ?? "adjustments"}`;
      }
      return `${base}, tuned for list pricing`;
    })
    .join("\n");

  return `Audit JSON — write executive summary:

Total current USD / month: ${formatUsd(result.totalCurrentMonthlySpend)}
Optimized USD / month: ${formatUsd(result.totalOptimizedMonthlySpend)}
Monthly savings USD: ${formatUsd(result.totalMonthlySavings)}
Annual savings USD: ${formatUsd(result.totalAnnualSavings)}

Tool ledger:
${toolLines}`;
}

function generateFallbackSummary(result: AuditResult): string {
  if (result.totalMonthlySavings <= 0.5) {
    return `Across ${result.toolResults.length} AI surface(s), your modeled USD invoices already track our May benchmarks — Saravanakumar flagged no deterministic waste at list prices. Ping us whenever your stack reshuffles and we'll re-run instantly.`;
  }

  const topSaver = [...result.toolResults].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0];

  return `Our USD-native Saravanakumar benchmarks uncovered ${formatUsd(result.totalMonthlySavings)} monthly — ${formatUsd(result.totalAnnualSavings)} annualized — with the largest wedge on ${topSaver.toolName}: ${topSaver.recommendedPlan ?? "a lighter SKU"} trims ${formatUsd(topSaver.monthlySavings)} / mo without rewriting workflows. Figures are deterministic from ${result.pricingReferenceDate}; plug in your negotiated rates for the final truth.`;
}

export async function generateAISummary(
  result: AuditResult
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log("[ai-summary] No ANTHROPIC_API_KEY set — using fallback.");
    return generateFallbackSummary(result);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(result) }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text();
      console.log(
        `[ai-summary] API returned ${response.status}: ${body.slice(0, 200)}`
      );
      return generateFallbackSummary(result);
    }

    const data = await response.json();
    const text: string | undefined = data?.content?.[0]?.text;

    if (!text || text.trim().length < 30) {
      console.log("[ai-summary] Empty or suspiciously short response.");
      return generateFallbackSummary(result);
    }

    return text.trim();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[ai-summary] Error: ${message} — fallback.`);
    return generateFallbackSummary(result);
  }
}
