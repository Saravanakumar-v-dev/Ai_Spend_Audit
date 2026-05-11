/**
 * Audit Engine - AI Spend Audit
 *
 * Calculates current spend and savings opportunities using INR-native pricing.
 * Values are stored in INR so the audit does not rely on a runtime
 * USD-to-INR conversion step.
 *
 * Pricing basis as of May 8, 2026:
 * - ChatGPT Business: official INR price from OpenAI's India-localized
 *   business pricing page.
 * - Other plans/models: official public USD pricing converted once into fixed
 *   INR reference amounts using a May 7, 2026 reference rate of 1 USD = Rs 94.37.
 */

import type { AuditFormData, AuditResult, ToolAuditResult } from "./validators";

type SubscriptionBilling = "flat" | "per_seat";

interface SubscriptionPlanPrice {
  priceInInr: number;
  annualMonthlyPriceInInr?: number;
  billing: SubscriptionBilling;
}

interface ApiModelPrice {
  inputPerMillionInr: number;
  outputPerMillionInr: number;
}

const PRICING_REFERENCE_DATE = "2026-05-08";
const MILLION_TOKENS = 1_000_000;

const TOOL_NAMES: Record<string, string> = {
  cursor: "Cursor",
  copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  api_anthropic_sonnet: "Anthropic API (Claude Sonnet 4)",
  api_openai_gpt5_4: "OpenAI API (GPT-5.4)",
  api_gemini_3_pro: "Gemini API (Gemini 2.5 Pro)",
};

const SUBSCRIPTION_PRICING: Record<string, Record<string, SubscriptionPlanPrice>> = {
  cursor: {
    pro: { priceInInr: 1887.4, billing: "flat" },
    teams: { priceInInr: 3774.8, billing: "per_seat" },
  },
  copilot: {
    individual: { priceInInr: 943.7, billing: "flat" },
    business: { priceInInr: 1793.03, billing: "per_seat" },
    enterprise: { priceInInr: 3680.43, billing: "per_seat" },
  },
  claude: {
    pro: { priceInInr: 1887.4, billing: "flat" },
    team_standard: {
      priceInInr: 2831.1,
      annualMonthlyPriceInInr: 2359.25,
      billing: "per_seat",
    },
    team_premium: { priceInInr: 14155.5, billing: "per_seat" },
  },
  chatgpt: {
    plus: { priceInInr: 1887.4, billing: "flat" },
    pro: { priceInInr: 18874, billing: "flat" },
    business: {
      priceInInr: 2359.25,
      annualMonthlyPriceInInr: 1800,
      billing: "per_seat",
    },
  },
};

const API_PRICING: Record<string, ApiModelPrice> = {
  api_anthropic_sonnet: {
    inputPerMillionInr: 283.11,
    outputPerMillionInr: 1415.55,
  },
  api_openai_gpt5_4: {
    inputPerMillionInr: 235.93,
    outputPerMillionInr: 1415.55,
  },
  api_gemini_3_pro: {
    inputPerMillionInr: 117.96,
    outputPerMillionInr: 943.7,
  },
  // Cheaper models used for right-sizing suggestions
  api_anthropic_haiku: {
    inputPerMillionInr: 75.5,     // Claude Haiku 3.5 — ~$0.80/M input
    outputPerMillionInr: 377.48,   // ~$4/M output
  },
  api_openai_4o_mini: {
    inputPerMillionInr: 14.16,     // GPT-4o-mini — ~$0.15/M input
    outputPerMillionInr: 56.62,    // ~$0.60/M output
  },
  api_gemini_flash: {
    inputPerMillionInr: 7.08,      // Gemini 2.5 Flash — ~$0.075/M input
    outputPerMillionInr: 28.31,    // ~$0.30/M output
  },
};

// Map each premium API model to its cheaper alternative for right-sizing
const API_CHEAPER_ALTERNATIVES: Record<string, { slug: string; name: string }> = {
  api_anthropic_sonnet: { slug: "api_anthropic_haiku", name: "Claude Haiku 3.5 (for routine tasks)" },
  api_openai_gpt5_4: { slug: "api_openai_4o_mini", name: "GPT-4o-mini (for routine tasks)" },
  api_gemini_3_pro: { slug: "api_gemini_flash", name: "Gemini 2.5 Flash (for routine tasks)" },
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatInr(value: number): string {
  return `Rs ${Math.round(value).toLocaleString("en-IN")}`;
}

function getToolName(toolSlug: string): string {
  return TOOL_NAMES[toolSlug] ?? toolSlug.replaceAll("_", " ");
}

function getSubscriptionPlan(
  toolSlug: string,
  planName: string
): SubscriptionPlanPrice | undefined {
  return SUBSCRIPTION_PRICING[toolSlug]?.[planName];
}

function getEffectivePlanPrice(
  plan: SubscriptionPlanPrice,
  billingCycle: "monthly" | "annual"
): number {
  if (billingCycle === "annual" && plan.annualMonthlyPriceInInr) {
    return plan.annualMonthlyPriceInInr;
  }

  return plan.priceInInr;
}

function calculateSubscriptionCost(
  toolSlug: string,
  planName: string,
  quantity: number,
  teamSize: number,
  billingCycle: "monthly" | "annual"
): number {
  const plan = getSubscriptionPlan(toolSlug, planName);

  if (!plan) {
    return 0;
  }

  const planPrice = getEffectivePlanPrice(plan, billingCycle);
  const monthlyCost =
    plan.billing === "per_seat" ? planPrice * teamSize : planPrice * quantity;

  return roundCurrency(monthlyCost);
}

export async function calculateAudit(
  formData: AuditFormData
): Promise<AuditResult> {
  const teamSize = formData.teamSize ?? 1;
  let totalCurrentMonthlySpend = 0;
  let totalOptimizedMonthlySpend = 0;
  const toolResults: ToolAuditResult[] = [];
  const recommendations: string[] = [];

  const toolSlugs = formData.tools.map((tool) => tool.toolSlug);

  for (const tool of formData.tools) {
    let currentCost = 0;
    let optimizedCost = 0;
    let recommendationStr = "";
    let recommendedPlan: string | undefined;
    const isApi = tool.toolSlug.startsWith("api_");

    if (isApi) {
      const apiPricing = API_PRICING[tool.toolSlug];

      if (apiPricing) {
        // Fallback to moderate usage if tokens aren't provided by the frontend
        let inputTokens = tool.estimatedMonthlyTokens?.inputTokens;
        let outputTokens = tool.estimatedMonthlyTokens?.outputTokens;
        
        if (!inputTokens && !outputTokens) {
          inputTokens = 10 * MILLION_TOKENS;
          outputTokens = 2 * MILLION_TOKENS;
        }

        const inputCost =
          ((inputTokens || 0) / MILLION_TOKENS) *
          apiPricing.inputPerMillionInr;
        const outputCost =
          ((outputTokens || 0) / MILLION_TOKENS) *
          apiPricing.outputPerMillionInr;

        currentCost = roundCurrency(inputCost + outputCost);
      }

      optimizedCost = currentCost;

      // ── NEW RULE: API Right-Sizing ──────────────────────────────────
      // Suggest a cheaper model if one exists in the same vendor family
      const cheaperModel = API_CHEAPER_ALTERNATIVES[tool.toolSlug];
      if (cheaperModel) {
        const cheaperPricing = API_PRICING[cheaperModel.slug];
        if (cheaperPricing) {
          const inputTokens = tool.estimatedMonthlyTokens?.inputTokens || 10 * MILLION_TOKENS;
          const outputTokens = tool.estimatedMonthlyTokens?.outputTokens || 2 * MILLION_TOKENS;
          const cheaperInputCost = (inputTokens / MILLION_TOKENS) * cheaperPricing.inputPerMillionInr;
          const cheaperOutputCost = (outputTokens / MILLION_TOKENS) * cheaperPricing.outputPerMillionInr;
          const cheaperTotal = roundCurrency(cheaperInputCost + cheaperOutputCost);

          if (cheaperTotal < optimizedCost) {
            optimizedCost = cheaperTotal;
            recommendedPlan = cheaperModel.name;
            recommendationStr = `For routine tasks (summarization, classification, simple Q&A), ${cheaperModel.name} costs ${formatInr(cheaperTotal)}/mo vs ${formatInr(currentCost)}/mo — saving ${formatInr(currentCost - cheaperTotal)}/mo. Reserve ${getToolName(tool.toolSlug)} for complex reasoning tasks only.`;
          }
        }
      }
    } else {
      currentCost = calculateSubscriptionCost(
        tool.toolSlug,
        tool.planName,
        tool.quantity,
        teamSize,
        tool.billingCycle
      );
      optimizedCost = currentCost;

      // ── NEW RULE: Annual Billing Suggestion ────────────────────────
      // If the user pays monthly but the annual rate is cheaper, suggest switching
      if (tool.billingCycle === "monthly") {
        const plan = getSubscriptionPlan(tool.toolSlug, tool.planName);
        if (plan && plan.annualMonthlyPriceInInr && plan.annualMonthlyPriceInInr < plan.priceInInr) {
          const annualCost = plan.billing === "per_seat"
            ? roundCurrency(plan.annualMonthlyPriceInInr * teamSize)
            : roundCurrency(plan.annualMonthlyPriceInInr * tool.quantity);
          
          if (annualCost < optimizedCost) {
            const monthlySaved = optimizedCost - annualCost;
            optimizedCost = annualCost;
            recommendedPlan = `${tool.planName} (annual billing)`;
            recommendationStr = `Switch from monthly to annual billing to save ${formatInr(monthlySaved)}/mo (${formatInr(monthlySaved * 12)}/year). Same plan, same features — just a billing change.`;
          }
        }
      }

      // ── NEW RULE: Unused Seat Detection ─────────────────────────────
      // If activeUsers is provided and less than teamSize, flag wasted seats
      if (
        tool.activeUsers !== undefined &&
        tool.activeUsers < teamSize &&
        ["per_seat"].includes(
          getSubscriptionPlan(tool.toolSlug, tool.planName)?.billing || ""
        )
      ) {
        const unusedSeats = teamSize - tool.activeUsers;
        const plan = getSubscriptionPlan(tool.toolSlug, tool.planName)!;
        const perSeatPrice = getEffectivePlanPrice(plan, tool.billingCycle);
        const rightSizedCost = roundCurrency(perSeatPrice * tool.activeUsers);

        if (rightSizedCost < optimizedCost) {
          const wastedAmount = optimizedCost - rightSizedCost;
          optimizedCost = rightSizedCost;
          recommendedPlan = `${tool.planName} (${tool.activeUsers} seats)`;
          recommendationStr = `You're paying for ${teamSize} seats but only ${tool.activeUsers} engineers actively use ${getToolName(tool.toolSlug)}. Removing ${unusedSeats} unused seat${unusedSeats > 1 ? "s" : ""} saves ${formatInr(wastedAmount)}/mo.`;
        }
      }

      // ── EXISTING RULE: Small Team Overkill ──────────────────────────
      if (
        teamSize <= 2 &&
        ["teams", "business", "enterprise", "team_standard", "team_premium"].includes(
          tool.planName
        )
      ) {
        let smallerTeamPlan: string | undefined;
        let smallerTeamMessage = "";

        if (tool.toolSlug === "cursor") {
          smallerTeamPlan = "pro";
          smallerTeamMessage = `Switching from Cursor Teams to Pro saves ${formatInr(getEffectivePlanPrice(SUBSCRIPTION_PRICING.cursor.teams, "monthly") - getEffectivePlanPrice(SUBSCRIPTION_PRICING.cursor.pro, "monthly"))}/seat with no loss of core coding functionality for a team of your size.`;
        } else if (tool.toolSlug === "copilot" && tool.planName === "enterprise") {
          smallerTeamPlan = "business";
          smallerTeamMessage = `Switching from GitHub Copilot Enterprise to Business saves ${formatInr(getEffectivePlanPrice(SUBSCRIPTION_PRICING.copilot.enterprise, "monthly") - getEffectivePlanPrice(SUBSCRIPTION_PRICING.copilot.business, "monthly"))}/seat with no loss of core coding functionality for a team of your size.`;
        } else if (tool.toolSlug === "copilot" && tool.planName === "business") {
          smallerTeamPlan = "individual";
          smallerTeamMessage = `Switching from GitHub Copilot Business to Individual saves ${formatInr(getEffectivePlanPrice(SUBSCRIPTION_PRICING.copilot.business, "monthly") - getEffectivePlanPrice(SUBSCRIPTION_PRICING.copilot.individual, "monthly"))}/seat with no loss of core coding functionality for a team of your size.`;
        } else if (tool.toolSlug === "claude") {
          smallerTeamPlan = "pro";
          smallerTeamMessage = `Switching from Claude Team to Pro saves ${formatInr(getEffectivePlanPrice(SUBSCRIPTION_PRICING.claude.team_standard, "monthly") - getEffectivePlanPrice(SUBSCRIPTION_PRICING.claude.pro, "monthly"))}/seat by eliminating unnecessary workspace administration overhead.`;
        } else if (tool.toolSlug === "chatgpt") {
          smallerTeamPlan = "plus";
          smallerTeamMessage = `Switching from ChatGPT Business to Plus saves ${formatInr(getEffectivePlanPrice(SUBSCRIPTION_PRICING.chatgpt.business, "monthly") - getEffectivePlanPrice(SUBSCRIPTION_PRICING.chatgpt.plus, "monthly"))}/seat by removing enterprise controls you do not need yet.`;
        }

        if (smallerTeamPlan) {
          const alternativeCost = calculateSubscriptionCost(
            tool.toolSlug,
            smallerTeamPlan,
            teamSize,
            teamSize,
            "monthly"
          );

          if (alternativeCost < optimizedCost) {
            optimizedCost = alternativeCost;
            recommendedPlan = smallerTeamPlan;
            recommendationStr = smallerTeamMessage;
          }
        }
      }

      // ── EXISTING RULE: Enterprise Negotiation ──────────────────────
      if (["enterprise", "team_premium"].includes(tool.planName)) {
        const negotiatedCost = roundCurrency(currentCost * 0.8);

        if (negotiatedCost < optimizedCost) {
          optimizedCost = negotiatedCost;
          recommendedPlan = `${tool.planName} (Saravanakumar Discount)`;
          recommendationStr =
            "Saravanakumar can explicitly negotiate enterprise discounts of around 20% on premium workspace tiers based on volume.";
        }
      }

      // ── EXISTING RULE: ChatGPT Pro Catch ───────────────────────────
      if (tool.toolSlug === "chatgpt" && tool.planName === "pro") {
        const alternativeCost = calculateSubscriptionCost(
          "chatgpt",
          "plus",
          tool.quantity,
          teamSize,
          "monthly"
        );

        if (alternativeCost < optimizedCost) {
          optimizedCost = alternativeCost;
          recommendedPlan = "plus";
          recommendationStr = `Switching from ChatGPT Pro to Plus saves about ${formatInr(
            currentCost - alternativeCost
          )} per month per user with minimal impact for mixed use cases.`;
        }
      }
    }

    currentCost = roundCurrency(currentCost);
    optimizedCost = roundCurrency(optimizedCost);

    const monthlySavings = roundCurrency(currentCost - optimizedCost);
    const savingsPercentage =
      currentCost > 0 ? (monthlySavings / currentCost) * 100 : 0;

    toolResults.push({
      toolSlug: tool.toolSlug,
      toolName: getToolName(tool.toolSlug),
      currentPlan: tool.planName,
      currentMonthlyCost: currentCost,
      recommendedPlan,
      recommendedMonthlyCost:
        optimizedCost !== currentCost ? optimizedCost : undefined,
      monthlySavings,
      savingsPercentage,
      reasoning: recommendationStr || "Your current plan is optimal for this tool.",
      isOverlap: false,
    });

    totalCurrentMonthlySpend += currentCost;
    totalOptimizedMonthlySpend += optimizedCost;

    if (recommendationStr) {
      recommendations.push(recommendationStr);
    }
  }

  const overlaps = detectOverlaps(toolSlugs, toolResults);
  for (const overlap of overlaps) {
    recommendations.push(overlap.recommendation);
    
    // Keep the first tool (now the cheapest), suggest cancelling the rest
    const toolsToCancel = overlap.tools.slice(1);
    
    overlap.tools.forEach((slug) => {
      const toolResult = toolResults.find((result) => result.toolSlug === slug);
      if (toolResult) {
        toolResult.isOverlap = true;
        toolResult.overlapWith = overlap.tools
          .filter((overlapSlug) => overlapSlug !== slug)
          .join(", ");
          
        if (toolsToCancel.includes(slug)) {
          const previousOptimized = toolResult.recommendedMonthlyCost ?? toolResult.currentMonthlyCost;
          
          toolResult.recommendedPlan = "Cancel / Consolidate";
          toolResult.recommendedMonthlyCost = 0;
          toolResult.monthlySavings = toolResult.currentMonthlyCost;
          toolResult.savingsPercentage = 100;
          toolResult.reasoning = `Consolidate AI tools. You can cancel this to save ${formatInr(toolResult.currentMonthlyCost)}/mo.`;
          
          totalOptimizedMonthlySpend -= previousOptimized;
        }
      }
    });
  }

  // ── NEW: Cross-category recommendations ───────────────────────────
  detectCrossCategory(toolResults, recommendations);

  totalCurrentMonthlySpend = roundCurrency(totalCurrentMonthlySpend);
  totalOptimizedMonthlySpend = roundCurrency(totalOptimizedMonthlySpend);

  const totalMonthlySavings = roundCurrency(
    totalCurrentMonthlySpend - totalOptimizedMonthlySpend
  );
  const totalAnnualSavings = roundCurrency(totalMonthlySavings * 12);
  const savingsPercentage =
    totalCurrentMonthlySpend > 0
      ? (totalMonthlySavings / totalCurrentMonthlySpend) * 100
      : 0;

  return {
    currency: "INR",
    pricingReferenceDate: PRICING_REFERENCE_DATE,
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

// ── NEW: Cross-category alternatives mapping ────────────────────────
// IDE tools that include built-in AI chat, making standalone chatbot
// subscriptions potentially redundant.
const IDE_WITH_BUILTIN_CHAT: Record<string, string> = {
  cursor: "Cursor includes Claude Sonnet via Auto mode",
  copilot: "Copilot includes GPT-5 via chat panel",
};

function detectCrossCategory(
  toolResults: ToolAuditResult[],
  recommendations: string[]
): void {
  const ideSlugs = toolResults
    .filter((t) => ["cursor", "copilot", "windsurf"].includes(t.toolSlug))
    .map((t) => t.toolSlug);
  const chatbotSlugs = toolResults
    .filter((t) => ["claude", "chatgpt"].includes(t.toolSlug))
    .map((t) => t.toolSlug);

  for (const ide of ideSlugs) {
    const builtIn = IDE_WITH_BUILTIN_CHAT[ide];
    if (!builtIn) continue;

    for (const chatbot of chatbotSlugs) {
      const chatResult = toolResults.find((t) => t.toolSlug === chatbot);
      if (!chatResult || chatResult.recommendedPlan === "Cancel / Consolidate") continue;

      // Only flag individual chatbot plans (Pro/Plus), not Team/Business plans
      // which provide additional workspace features
      const individualPlans = ["pro", "plus"];
      if (individualPlans.includes(chatResult.currentPlan)) {
        chatResult.crossCategoryNote = `💡 ${builtIn} — you may not need a separate ${chatResult.toolName} subscription if you primarily use it for coding assistance.`;
        recommendations.push(
          `Consider whether your ${getToolName(ide)} subscription already covers your ${chatResult.toolName} use case. ${builtIn}.`
        );
      }
    }
  }
}

export function detectOverlaps(
  toolSlugs: string[],
  toolResults?: ToolAuditResult[]
): Array<{ tools: string[]; category: string; recommendation: string }> {
  const overlaps = [];

  const ides = ["cursor", "copilot", "windsurf"].filter((toolSlug) =>
    toolSlugs.includes(toolSlug)
  );
  if (ides.length > 1) {
    // ── IMPROVED: Smart overlap — keep the cheaper tool ──────────
    let sortedIdes = ides;
    if (toolResults) {
      sortedIdes = [...ides].sort((a, b) => {
        const costA = toolResults.find((t) => t.toolSlug === a)?.currentMonthlyCost ?? 0;
        const costB = toolResults.find((t) => t.toolSlug === b)?.currentMonthlyCost ?? 0;
        return costA - costB; // cheapest first (will be kept)
      });
    }
    overlaps.push({
      tools: sortedIdes,
      category: "ide",
      recommendation: `You are paying for multiple IDE assistants (${sortedIdes.join(
        " and "
      )}). Standardizing on ${getToolName(sortedIdes[0])} (cheapest) can eliminate redundant spending.`,
    });
  }

  const chatbots = ["chatgpt", "claude"].filter((toolSlug) =>
    toolSlugs.includes(toolSlug)
  );
  if (chatbots.length > 1) {
    let sortedChatbots = chatbots;
    if (toolResults) {
      sortedChatbots = [...chatbots].sort((a, b) => {
        const costA = toolResults.find((t) => t.toolSlug === a)?.currentMonthlyCost ?? 0;
        const costB = toolResults.find((t) => t.toolSlug === b)?.currentMonthlyCost ?? 0;
        return costA - costB;
      });
    }
    overlaps.push({
      tools: sortedChatbots,
      category: "chatbot",
      recommendation: `You are paying for multiple premium chatbots (${sortedChatbots.join(
        " and "
      )}). Most teams only need one frontier model interface. Keeping ${getToolName(sortedChatbots[0])} (cheapest).`,
    });
  }

  return overlaps;
}
