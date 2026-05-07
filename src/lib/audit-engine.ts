/**
 * Audit Engine — AI Spend Audit
 *
 * Implements the core logic for calculating current spend, finding
 * optimizations, and suggesting alternatives.
 */

import type { AuditFormData, AuditResult, ToolAuditResult } from "./validators";

// Hardcoded verified May 2026 pricing data
const PRICING_DB = {
  cursor: {
    pro: { price: 20, billing: "flat" },
    teams: { price: 40, billing: "per_seat" },
  },
  copilot: {
    individual: { price: 10, billing: "flat" },
    business: { price: 19, billing: "per_seat" },
    enterprise: { price: 39, billing: "per_seat" },
  },
  claude: {
    pro: { price: 20, billing: "flat" },
    team_standard: { price: 30, billing: "per_seat" },
    team_premium: { price: 150, billing: "per_seat" },
  },
  chatgpt: {
    plus: { price: 20, billing: "flat" },
    pro: { price: 100, billing: "flat" },
    business: { price: 25, billing: "per_seat" },
  },
  api_anthropic_sonnet: {
    input: 3.0, // per 1M tokens
    output: 15.0, // per 1M tokens
  },
  api_openai_gpt5_4: {
    input: 2.5, // per 1M tokens
    output: 15.0, // per 1M tokens
  },
  api_gemini_3_pro: {
    input: 4.0, // combined avg per 1M tokens
    output: 4.0,
  },
};

export async function calculateAudit(
  formData: AuditFormData
): Promise<AuditResult> {
  let totalCurrentMonthlySpend = 0;
  let totalOptimizedMonthlySpend = 0;
  const toolResults: ToolAuditResult[] = [];
  const recommendations: string[] = [];

  const toolSlugs = formData.tools.map((t) => t.toolSlug);

  // 1. Process each tool
  for (const tool of formData.tools) {
    let currentCost = 0;
    let optimizedCost = 0;
    let recommendationStr = "";
    let recommendedPlan = undefined;
    const isApi = tool.toolSlug.startsWith("api_");

    if (isApi) {
      // API Cost Calculation
      const apiPricing = PRICING_DB[tool.toolSlug as keyof typeof PRICING_DB] as any;
      if (apiPricing && tool.estimatedMonthlyTokens) {
        const inputCost =
          (tool.estimatedMonthlyTokens.inputTokens || 0) * apiPricing.input;
        const outputCost =
          (tool.estimatedMonthlyTokens.outputTokens || 0) * apiPricing.output;
        currentCost = inputCost + outputCost;
      }
      optimizedCost = currentCost; // Baseline API assumes no direct optimization yet without deep caching analysis
    } else {
      // Subscription Cost Calculation
      const toolPricing = PRICING_DB[tool.toolSlug as keyof typeof PRICING_DB] as any;
      if (toolPricing && toolPricing[tool.planName]) {
        const planData = toolPricing[tool.planName];
        currentCost =
          planData.billing === "per_seat"
            ? planData.price * formData.teamSize
            : planData.price * tool.quantity; // Flat usually means per license/account provided

        optimizedCost = currentCost;

        // Rule 1: Identify "Overkill"
        if (
          formData.teamSize <= 2 &&
          ["teams", "business", "team_standard", "team_premium"].includes(
            tool.planName
          )
        ) {
          // Suggest downgrading to individual/pro
          if (tool.toolSlug === "cursor") {
            optimizedCost = PRICING_DB.cursor.pro.price * formData.teamSize;
            recommendedPlan = "pro";
            recommendationStr = `Your team of ${formData.teamSize} is paying for Teams. Switching to Pro saves money with nearly identical features for small teams.`;
          } else if (tool.toolSlug === "copilot") {
            optimizedCost = PRICING_DB.copilot.individual.price * formData.teamSize;
            recommendedPlan = "individual";
            recommendationStr = `Your team of ${formData.teamSize} is paying for Business. Switching to Individual saves money with nearly identical features for small teams.`;
          } else if (tool.toolSlug === "claude") {
            optimizedCost = PRICING_DB.claude.pro.price * formData.teamSize;
            recommendedPlan = "pro";
            recommendationStr = `Your team of ${formData.teamSize} is paying for Team. Switching to Pro saves money with nearly identical features for small teams.`;
          } else if (tool.toolSlug === "chatgpt") {
            optimizedCost = PRICING_DB.chatgpt.plus.price * formData.teamSize;
            recommendedPlan = "plus";
            recommendationStr = `Your team of ${formData.teamSize} is paying for Business. Switching to Plus saves money with nearly identical features for small teams.`;
          }
        }

        // Rule 2: Compare retail vs credits (Saravanakumar 20% discount on Enterprise tiers)
        if (["enterprise", "team_premium"].includes(tool.planName)) {
          optimizedCost = currentCost * 0.8;
          recommendedPlan = `${tool.planName} (Saravanakumar Discount)`;
          recommendationStr = `Saravanakumar can negotiate a 20% discount on your Enterprise/Premium tiers, saving you significant overhead.`;
        }

        // Rule 3: Suggest alternatives (ChatGPT Pro to Plus)
        if (tool.toolSlug === "chatgpt" && tool.planName === "pro") {
          const alternativeCost = PRICING_DB.chatgpt.plus.price * tool.quantity;
          if (alternativeCost < optimizedCost) {
            optimizedCost = alternativeCost;
            recommendedPlan = "plus";
            recommendationStr = `Switching from ChatGPT Pro to Plus saves $80/mo per user with minimal impact for mixed use cases.`;
          }
        }
      }
    }

    const monthlySavings = currentCost - optimizedCost;
    const savingsPercentage = currentCost > 0 ? (monthlySavings / currentCost) * 100 : 0;

    toolResults.push({
      toolSlug: tool.toolSlug,
      toolName: tool.toolSlug.charAt(0).toUpperCase() + tool.toolSlug.slice(1),
      currentPlan: tool.planName,
      currentMonthlyCost: currentCost,
      recommendedPlan,
      recommendedMonthlyCost: optimizedCost !== currentCost ? optimizedCost : undefined,
      monthlySavings,
      savingsPercentage,
      reasoning: recommendationStr || "Your current plan is optimal for this tool.",
      isOverlap: false,
    });

    totalCurrentMonthlySpend += currentCost;
    totalOptimizedMonthlySpend += optimizedCost;
    if (recommendationStr) recommendations.push(recommendationStr);
  }

  // Check Overlaps
  const overlaps = detectOverlaps(toolSlugs);
  for (const overlap of overlaps) {
    recommendations.push(overlap.recommendation);
    // Mark tools as overlapping in the result
    overlap.tools.forEach((slug) => {
      const tr = toolResults.find((t) => t.toolSlug === slug);
      if (tr) {
        tr.isOverlap = true;
        tr.overlapWith = overlap.tools.filter((s) => s !== slug).join(", ");
      }
    });
  }

  const totalMonthlySavings = totalCurrentMonthlySpend - totalOptimizedMonthlySpend;
  const totalAnnualSavings = totalMonthlySavings * 12;
  const savingsPercentage =
    totalCurrentMonthlySpend > 0
      ? (totalMonthlySavings / totalCurrentMonthlySpend) * 100
      : 0;

  return {
    totalCurrentMonthlySpend,
    totalOptimizedMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsPercentage,
    toolResults,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

export function detectOverlaps(
  toolSlugs: string[]
): Array<{ tools: string[]; category: string; recommendation: string }> {
  const overlaps = [];

  const ides = ["cursor", "copilot", "windsurf"].filter((t) =>
    toolSlugs.includes(t)
  );
  if (ides.length > 1) {
    overlaps.push({
      tools: ides,
      category: "ide",
      recommendation: `You are paying for multiple IDE assistants (${ides.join(
        " and "
      )}). Standardizing on one can eliminate redundant spending.`,
    });
  }

  const chatbots = ["chatgpt", "claude"].filter((t) => toolSlugs.includes(t));
  if (chatbots.length > 1) {
    overlaps.push({
      tools: chatbots,
      category: "chatbot",
      recommendation: `You are paying for multiple premium chatbots (${chatbots.join(
        " and "
      )}). Most teams only need one frontier model interface.`,
    });
  }

  return overlaps;
}
