/**
 * Audit Engine — AI Spend Audit
 *
 * ⚠️ PLACEHOLDER — DO NOT IMPLEMENT LOGIC YET
 *
 * This file defines the interface and stub for the audit calculation engine.
 * The actual logic will be implemented after:
 *   1. User interviews are complete (to validate assumptions)
 *   2. Pricing data is verified (PRICING_DATA.md checklist complete)
 *   3. Architecture is approved
 *
 * The engine will:
 *   - Accept user's tool selections and team size
 *   - Look up current pricing from the database
 *   - Calculate current monthly/annual spend
 *   - Identify optimization opportunities (plan downgrades, tool consolidation)
 *   - Detect overlapping tools (e.g., Copilot + Cursor, ChatGPT + Claude)
 *   - Generate personalized recommendations
 *   - Return a structured AuditResult object
 */

import type { AuditFormData, AuditResult } from "./validators";
import type { PricingEntry } from "./pricing";

/**
 * Run the audit calculation engine.
 *
 * @param formData - Validated form input from the user
 * @param pricingData - Pricing entries for the selected tools
 * @returns Computed audit result with savings breakdown
 *
 * @example
 * const result = await calculateAudit(formData, pricingData);
 * // result.totalMonthlySavings → e.g., 1250
 * // result.savingsPercentage → e.g., 32
 */
export async function calculateAudit(
  formData: AuditFormData,
  pricingData: PricingEntry[]
): Promise<AuditResult> {
  // TODO: Implement after Discovery & Foundation phase is complete
  //
  // Implementation plan:
  // 1. For each tool in formData.tools:
  //    a. Find matching pricing entry
  //    b. Calculate current cost (price × quantity × billing cycle)
  //    c. Compare against cheaper alternatives/plans
  //    d. Check for overlaps with other selected tools
  // 2. Aggregate totals
  // 3. Generate recommendations
  // 4. Return AuditResult

  void formData;
  void pricingData;

  throw new Error(
    "Audit engine not yet implemented. " +
      "Complete the Discovery & Foundation phase first."
  );
}

/**
 * Detect overlapping tools that serve similar purposes.
 *
 * @example
 * detectOverlaps(["cursor_pro", "copilot_business"])
 * // → [{ tools: ["cursor_pro", "copilot_business"], category: "ide", recommendation: "..." }]
 */
export function detectOverlaps(
  _toolSlugs: string[]
): Array<{
  tools: string[];
  category: string;
  recommendation: string;
}> {
  // TODO: Implement overlap detection logic
  // Known overlaps to detect:
  // - IDE: Cursor + Copilot + Windsurf (pick one)
  // - Chatbot: ChatGPT + Claude (may be intentional, but flag cost)
  // - API + Chatbot: OpenAI API + ChatGPT Pro, Anthropic API + Claude Max
  // - UI Gen: v0 overlaps partially with IDE assistants

  return [];
}
