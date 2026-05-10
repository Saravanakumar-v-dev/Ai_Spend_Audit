/**
 * AI Summary Generator — Feature 4
 *
 * Connects to the Anthropic API to generate a personalised ~100-word
 * savings summary based on the deterministic audit result.
 *
 * CRUCIAL: implements a graceful fallback. If the API call fails for any
 * reason (timeout, rate-limit, missing key, bad response), the caller
 * receives a professionally written template string instead — the app
 * never breaks.
 */

import type { AuditResult } from "./validators";

// ---------------------------------------------------------------------------
// Prompt templates
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a senior FinOps analyst writing a short executive summary for a startup founder.
Rules:
1. Use ONLY the numbers provided in the JSON — never invent or extrapolate savings.
2. Refer to currency as "Rs" (Indian Rupees).
3. Keep the summary between 80 and 120 words.
4. Use a professional but warm tone — no buzzwords, no hype.
5. Mention the specific tools where savings were found.
6. If total savings are zero, congratulate the founder on a well-optimised stack.
7. Never mention email addresses, company names, or any personally identifiable information.`;

function buildUserPrompt(result: AuditResult): string {
  const toolLines = result.toolResults
    .map(
      (t) =>
        `- ${t.toolName} (${t.currentPlan}): current Rs ${Math.round(t.currentMonthlyCost).toLocaleString("en-IN")}/mo` +
        (t.monthlySavings > 0
          ? `, potential saving Rs ${Math.round(t.monthlySavings).toLocaleString("en-IN")}/mo by switching to ${t.recommendedPlan}`
          : `, already optimised`)
    )
    .join("\n");

  return `Here is the audit result. Write the executive summary now.

Total current monthly spend: Rs ${Math.round(result.totalCurrentMonthlySpend).toLocaleString("en-IN")}
Total optimised monthly spend: Rs ${Math.round(result.totalOptimizedMonthlySpend).toLocaleString("en-IN")}
Total monthly savings: Rs ${Math.round(result.totalMonthlySavings).toLocaleString("en-IN")}
Total annual savings: Rs ${Math.round(result.totalAnnualSavings).toLocaleString("en-IN")}

Tool breakdown:
${toolLines}`;
}

// ---------------------------------------------------------------------------
// Graceful fallback
// ---------------------------------------------------------------------------

function generateFallbackSummary(result: AuditResult): string {
  if (result.totalMonthlySavings <= 0) {
    return `Your AI stack is well-optimised. Based on our May 2026 pricing benchmarks across ${result.toolResults.length} tool(s), there are no significant cost reductions available for your current configuration. We will notify you when new pricing changes create fresh optimisation opportunities.`;
  }

  const topSaver = [...result.toolResults].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0];

  return `Our analysis identified Rs ${Math.round(result.totalMonthlySavings).toLocaleString("en-IN")} in potential monthly savings across ${result.toolResults.length} AI tool(s) — that is Rs ${Math.round(result.totalAnnualSavings).toLocaleString("en-IN")} annually. The largest opportunity is ${topSaver.toolName}, where switching from ${topSaver.currentPlan} to ${topSaver.recommendedPlan ?? "a lower tier"} saves Rs ${Math.round(topSaver.monthlySavings).toLocaleString("en-IN")} per month without impacting core functionality. These figures are based on verified May 2026 pricing and are 100% deterministic.`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateAISummary(
  result: AuditResult
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // If no API key configured, skip the network call entirely
  if (!apiKey) {
    console.log("[ai-summary] No ANTHROPIC_API_KEY set — using fallback.");
    return generateFallbackSummary(result);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s hard timeout

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
    // Covers AbortError (timeout), network failures, JSON parse errors, etc.
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[ai-summary] Caught error: ${message} — using fallback.`);
    return generateFallbackSummary(result);
  }
}
