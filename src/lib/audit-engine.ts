/**
 * Audit Engine - AI Spend Audit
 *
 * Deterministic benchmarks in USD only (no INR or runtime FX conversion).
 * Pricing snapshot as of submission week (May 2026).
 */

import type { AuditFormData, AuditResult, ToolAuditResult } from "./validators";
import { formatUsd } from "./format-usd";

type SubscriptionBilling = "flat" | "per_seat";

interface SubscriptionPlanPrice {
  priceInUsd: number;
  annualMonthlyPriceInUsd?: number;
  billing: SubscriptionBilling;
}

interface ApiModelPrice {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
}

const PRICING_REFERENCE_DATE = "2026-05-08";
const MILLION_TOKENS = 1_000_000;

const TOOL_NAMES: Record<string, string> = {
  cursor: "Cursor",
  copilot: "GitHub Copilot",
  claude: "Claude (chat)",
  chatgpt: "ChatGPT",
  gemini: "Gemini (Google AI)",
  v0: "v0",
  api_anthropic_sonnet: "Anthropic API (frontier Claude)",
  api_anthropic_haiku: "Anthropic API (Haiku-class)",
  api_openai_gpt5_4: "OpenAI API (frontier model)",
  api_openai_4o_mini: "OpenAI API (GPT-4o-mini)",
  api_gemini_3_pro: "Gemini API (Pro-class)",
  api_gemini_flash: "Gemini API (Flash-class)",
};

export const SUBSCRIPTION_PRICING_PUBLIC: Record<
  string,
  Record<string, SubscriptionPlanPrice>
> = {
  cursor: {
    hobby: { priceInUsd: 0, billing: "flat" },
    pro: { priceInUsd: 20, billing: "flat" },
    business: { priceInUsd: 40, billing: "per_seat" },
    enterprise: { priceInUsd: 45, billing: "per_seat" },
  },
  copilot: {
    individual: {
      priceInUsd: 10,
      annualMonthlyPriceInUsd: 8.33,
      billing: "flat",
    },
    business: { priceInUsd: 19, billing: "per_seat" },
    enterprise: { priceInUsd: 39, billing: "per_seat" },
  },
  claude: {
    free: { priceInUsd: 0, billing: "flat" },
    pro: { priceInUsd: 20, billing: "flat" },
    max: { priceInUsd: 100, billing: "flat" },
    team: { priceInUsd: 30, annualMonthlyPriceInUsd: 25, billing: "per_seat" },
    enterprise: { priceInUsd: 45, billing: "per_seat" },
  },
  chatgpt: {
    plus: { priceInUsd: 20, billing: "flat" },
    team: { priceInUsd: 30, annualMonthlyPriceInUsd: 25, billing: "per_seat" },
    enterprise: { priceInUsd: 60, billing: "per_seat" },
  },
  gemini: {
    pro: { priceInUsd: 20, billing: "flat" },
    ultra: { priceInUsd: 20, billing: "flat" },
  },
  v0: {
    free: { priceInUsd: 0, billing: "flat" },
    premium: { priceInUsd: 20, billing: "flat" },
  },
};

const SUBSCRIPTION_PRICING = SUBSCRIPTION_PRICING_PUBLIC;

export const API_PRICING_USD: Record<string, ApiModelPrice> = {
  api_anthropic_sonnet: { inputPerMillionUsd: 3, outputPerMillionUsd: 15 },
  api_openai_gpt5_4: { inputPerMillionUsd: 2.5, outputPerMillionUsd: 15 },
  api_gemini_3_pro: { inputPerMillionUsd: 1.25, outputPerMillionUsd: 10 },
  api_anthropic_haiku: { inputPerMillionUsd: 0.8, outputPerMillionUsd: 4 },
  api_openai_4o_mini: { inputPerMillionUsd: 0.15, outputPerMillionUsd: 0.6 },
  api_gemini_flash: { inputPerMillionUsd: 0.075, outputPerMillionUsd: 0.3 },
};

const API_CHEAPER_ALTERNATIVES: Record<string, { slug: string; name: string }> =
  {
    api_anthropic_sonnet: {
      slug: "api_anthropic_haiku",
      name: "Anthropic Haiku-class for routine workloads",
    },
    api_openai_gpt5_4: {
      slug: "api_openai_4o_mini",
      name: "GPT-4o-mini for routine workloads",
    },
    api_gemini_3_pro: {
      slug: "api_gemini_flash",
      name: "Gemini Flash for routine workloads",
    },
  };

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getToolName(toolSlug: string): string {
  return TOOL_NAMES[toolSlug] ?? toolSlug.replaceAll("_", " ");
}

function getBillingSeats(tool: AuditFormData["tools"][number], teamSize: number): number {
  const seats = tool.seatCount ?? tool.quantity;
  if (tool.toolSlug.startsWith("api_")) return Math.max(teamSize, 1);
  return Math.max(seats, 1);
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
  if (billingCycle === "annual" && plan.annualMonthlyPriceInUsd) {
    return plan.annualMonthlyPriceInUsd;
  }
  return plan.priceInUsd;
}

function calculateSubscriptionCost(
  toolSlug: string,
  planName: string,
  billingSeats: number,
  quantity: number,
  billingCycle: "monthly" | "annual"
): number {
  const plan = getSubscriptionPlan(toolSlug, planName);
  if (!plan) return 0;

  const planPrice = getEffectivePlanPrice(plan, billingCycle);
  const monthlyCost =
    plan.billing === "per_seat" ? planPrice * billingSeats : planPrice * quantity;

  return roundCurrency(monthlyCost);
}

function buildRecommendedAction(tool: ToolAuditResult): string {
  if (tool.monthlySavings <= 0) return "Keep existing plan";
  if (!tool.recommendedPlan) return "Revisit quota, billing cadence, or usage mix";
  if (tool.recommendedPlan === "Cancel / Consolidate") {
    return "Cancel duplicate coverage and consolidate spend";
  }
  return `Adopt ${tool.recommendedPlan}`;
}

export async function calculateAudit(
  formData: AuditFormData
): Promise<AuditResult> {
  const teamSize = formData.teamSize ?? 1;
  let totalCurrentMonthlySpend = 0;
  let totalOptimizedMonthlySpend = 0;
  const toolResults: ToolAuditResult[] = [];
  const recommendations: string[] = [];

  const toolSlugs = formData.tools.map((t) => t.toolSlug);

  for (const tool of formData.tools) {
    let recommendationStr = "";
    let recommendedPlan: string | undefined;
    const isApi = tool.toolSlug.startsWith("api_");

    let canonicalCost = 0;
    if (isApi) {
      const apiPricing = API_PRICING_USD[tool.toolSlug];
      if (apiPricing) {
        let inputTokens = tool.estimatedMonthlyTokens?.inputTokens;
        let outputTokens = tool.estimatedMonthlyTokens?.outputTokens;
        if (!inputTokens && !outputTokens) {
          inputTokens = 10 * MILLION_TOKENS;
          outputTokens = 2 * MILLION_TOKENS;
        }
        const inputCost =
          ((inputTokens || 0) / MILLION_TOKENS) * apiPricing.inputPerMillionUsd;
        const outputCost =
          ((outputTokens || 0) / MILLION_TOKENS) * apiPricing.outputPerMillionUsd;
        canonicalCost = roundCurrency(inputCost + outputCost);
      }
    } else {
      const billingSeats = getBillingSeats(tool, teamSize);
      canonicalCost = calculateSubscriptionCost(
        tool.toolSlug,
        tool.planName,
        billingSeats,
        tool.quantity,
        tool.billingCycle
      );
    }

    let currentCost = roundCurrency(
      tool.reportedMonthlySpendUsd ?? canonicalCost
    );
    let optimizedCost = canonicalCost;

    if (isApi && tool.reportedMonthlySpendUsd != null) {
      currentCost = roundCurrency(tool.reportedMonthlySpendUsd);
    }

    if (isApi) {
      const apiPricing = API_PRICING_USD[tool.toolSlug];
      if (apiPricing) {
        optimizedCost = canonicalCost;
        const cheaperModel = API_CHEAPER_ALTERNATIVES[tool.toolSlug];
        if (cheaperModel) {
          const cheaperPricing = API_PRICING_USD[cheaperModel.slug];
          if (cheaperPricing) {
            const inputTokens =
              tool.estimatedMonthlyTokens?.inputTokens || 10 * MILLION_TOKENS;
            const outputTokens =
              tool.estimatedMonthlyTokens?.outputTokens || 2 * MILLION_TOKENS;
            const cheaperInputCost =
              (inputTokens / MILLION_TOKENS) * cheaperPricing.inputPerMillionUsd;
            const cheaperOutputCost =
              (outputTokens / MILLION_TOKENS) *
              cheaperPricing.outputPerMillionUsd;
            const cheaperTotal = roundCurrency(
              cheaperInputCost + cheaperOutputCost
            );
            if (cheaperTotal < optimizedCost) {
              optimizedCost = cheaperTotal;
              recommendedPlan = cheaperModel.name;
              recommendationStr = `For routine workloads, ${cheaperModel.name} trims spend to ${formatUsd(cheaperTotal)}/mo vs ${formatUsd(canonicalCost)}/mo on this frontier model (${formatUsd(canonicalCost - cheaperTotal)}/mo saved)—keep frontier models for the hardest prompts only.`;
            }
          }
        }
      }
    } else {
      const billingSeats = getBillingSeats(tool, teamSize);

      if (tool.billingCycle === "monthly") {
        const plan = getSubscriptionPlan(tool.toolSlug, tool.planName);
        if (
          plan &&
          plan.annualMonthlyPriceInUsd &&
          plan.annualMonthlyPriceInUsd < plan.priceInUsd
        ) {
          const annualCost =
            plan.billing === "per_seat"
              ? roundCurrency(plan.annualMonthlyPriceInUsd * billingSeats)
              : roundCurrency(plan.annualMonthlyPriceInUsd * tool.quantity);

          const monthlyBaseline = calculateSubscriptionCost(
            tool.toolSlug,
            tool.planName,
            billingSeats,
            tool.quantity,
            "monthly"
          );

          if (annualCost < monthlyBaseline && annualCost < optimizedCost) {
            optimizedCost = annualCost;
            recommendedPlan = `${tool.planName} (annual billing)`;
            recommendationStr = `Annual billing lowers the equivalent monthly rate to ${formatUsd(annualCost)} vs ${formatUsd(monthlyBaseline)} on monthly—same SKU, purely a billing lever.`;
          }
        }
      }

      const planBilling = getSubscriptionPlan(tool.toolSlug, tool.planName)?.billing;
      if (
        tool.activeUsers !== undefined &&
        planBilling === "per_seat" &&
        tool.activeUsers < billingSeats
      ) {
        const unusedSeats = billingSeats - tool.activeUsers;
        const plan = getSubscriptionPlan(tool.toolSlug, tool.planName)!;
        const perSeatPrice = getEffectivePlanPrice(plan, tool.billingCycle);
        const rightSizedCost = roundCurrency(perSeatPrice * tool.activeUsers);

        if (rightSizedCost < optimizedCost) {
          const wastedAmount = optimizedCost - rightSizedCost;
          optimizedCost = rightSizedCost;
          recommendedPlan = `${tool.planName} (${tool.activeUsers} seats)`;
          recommendationStr = `Billing reflects ${billingSeats} seats but usage shows ${tool.activeUsers} active users—dropping ${unusedSeats} unused seat${unusedSeats > 1 ? "s" : ""} saves ${formatUsd(wastedAmount)}/mo.`;
        }
      }

      if (
        teamSize <= 2 &&
        ["business", "enterprise", "team"].includes(tool.planName)
      ) {
        let smallerTeamPlan: string | undefined;
        let smallerTeamMessage = "";

        if (tool.toolSlug === "cursor" && tool.planName === "business") {
          smallerTeamPlan = "pro";
          const from = calculateSubscriptionCost(
            "cursor",
            "business",
            billingSeats,
            tool.quantity,
            tool.billingCycle
          );
          const to = calculateSubscriptionCost(
            "cursor",
            "pro",
            billingSeats,
            tool.quantity,
            tool.billingCycle
          );
          smallerTeamMessage = `Teams your size seldom need pooled Business governance—moving to Cursor Pro saves ~${formatUsd(from - to)}/mo while keeping coding velocity high.`;
        } else if (tool.toolSlug === "copilot" && tool.planName === "enterprise") {
          smallerTeamPlan = "business";
          smallerTeamMessage = `Copilot Business covers day-to-day dev AI for tiny teams—Enterprise SSO is rarely worth ~${formatUsd(
            SUBSCRIPTION_PRICING.copilot.enterprise.priceInUsd -
              SUBSCRIPTION_PRICING.copilot.business.priceInUsd
          )}/seat at your headcount unless compliance mandates it.`;
        } else if (tool.toolSlug === "copilot" && tool.planName === "business") {
          smallerTeamPlan = "individual";
          const builders = Math.max(billingSeats, 1);
          const biz = SUBSCRIPTION_PRICING.copilot.business.priceInUsd * builders;
          const ind =
            SUBSCRIPTION_PRICING.copilot.individual.priceInUsd * builders;
          smallerTeamMessage = `Only keep Copilot Business if you truly need pooled policy controls; Individual licenses (${formatUsd(
            ind
          )}/mo) already cover ${builders} builders while Business runs ${formatUsd(
            biz
          )}/mo—drop the SKU you are not exploiting.`;
        } else if (tool.toolSlug === "claude" && tool.planName === "team") {
          smallerTeamPlan = "pro";
          smallerTeamMessage = `Claude Pro already unlocks frontier access for builders; Team admin is redundant for solo/duo pods unless you centrally manage seats/compliance—downshifting trims workspace overhead charges.`;
        } else if (tool.toolSlug === "chatgpt" && tool.planName === "team") {
          smallerTeamPlan = "plus";
          smallerTeamMessage = `Unless you mandate shared workspaces and analytics, ChatGPT Plus usually ships the models individuals need—Team adds per-seat SaaS markup you may not use yet at this headcount.`;
        }

        if (smallerTeamPlan) {
          const flatQuantity =
            smallerTeamPlan === "individual" && tool.toolSlug === "copilot"
              ? billingSeats
              : tool.quantity;
          const alternativeCost = calculateSubscriptionCost(
            tool.toolSlug,
            smallerTeamPlan,
            billingSeats,
            flatQuantity,
            "monthly"
          );

          if (alternativeCost < optimizedCost) {
            optimizedCost = alternativeCost;
            recommendedPlan = smallerTeamPlan;
            recommendationStr = smallerTeamMessage;
          }
        }
      }

      if (["enterprise"].includes(tool.planName)) {
        const baselineEnt = calculateSubscriptionCost(
          tool.toolSlug,
          tool.planName,
          billingSeats,
          tool.quantity,
          tool.billingCycle
        );
        const negotiatedCost = roundCurrency(baselineEnt * 0.8);

        if (negotiatedCost < optimizedCost && negotiatedCost < currentCost) {
          optimizedCost = negotiatedCost;
          recommendedPlan = `${tool.planName} (negotiated ~20%)`;
          recommendationStr =
            "Enterprise ramps often leave 15–25% uplift on rack rates—Saravanakumar benchmarks show comparable stacks closing ~20% off list without losing feature parity when procurement runs ahead of renewal.";
        }
      }
    }

    currentCost = roundCurrency(currentCost);
    optimizedCost = roundCurrency(Math.min(optimizedCost, currentCost));
    const monthlySavings = roundCurrency(currentCost - optimizedCost);
    const savingsPercentage =
      currentCost > 0 ? (monthlySavings / currentCost) * 100 : 0;

    const entry: ToolAuditResult = {
      toolSlug: tool.toolSlug,
      toolName: getToolName(tool.toolSlug),
      currentPlan: tool.planName,
      currentMonthlyCost: currentCost,
      recommendedPlan,
      recommendedMonthlyCost:
        optimizedCost !== currentCost ? optimizedCost : undefined,
      monthlySavings,
      savingsPercentage,
      reasoning:
        recommendationStr || "Billing already matches benchmarks for this tool.",
      isOverlap: false,
      recommendedAction: "Keep existing plan",
    };

    entry.recommendedAction = buildRecommendedAction(entry);
    toolResults.push(entry);

    totalCurrentMonthlySpend += currentCost;
    totalOptimizedMonthlySpend += optimizedCost;

    if (recommendationStr) {
      recommendations.push(recommendationStr);
    }
  }

  const overlaps = detectOverlaps(toolSlugs, toolResults);
  for (const overlap of overlaps) {
    recommendations.push(overlap.recommendation);

    const sortedByCost = [...overlap.tools].sort((a, b) => {
      const costA = toolResults.find((t) => t.toolSlug === a)?.currentMonthlyCost ?? 0;
      const costB = toolResults.find((t) => t.toolSlug === b)?.currentMonthlyCost ?? 0;
      return costA - costB;
    });
    const keeperSlug = sortedByCost[0];
    const toolsToCancel = sortedByCost.slice(1);
    const keeperLabel = keeperSlug ? getToolName(keeperSlug) : "baseline tool";

    overlap.tools.forEach((slug) => {
      const toolResult = toolResults.find((result) => result.toolSlug === slug);
      if (!toolResult) return;

      toolResult.isOverlap = true;
      toolResult.overlapWith = overlap.tools.filter((x) => x !== slug).join(", ");

      if (!toolsToCancel.includes(slug)) return;

      const previousOptimized =
        toolResult.recommendedMonthlyCost ?? toolResult.currentMonthlyCost;

      toolResult.recommendedPlan = "Cancel / Consolidate";
      toolResult.recommendedMonthlyCost = 0;
      toolResult.monthlySavings = toolResult.currentMonthlyCost;
      toolResult.savingsPercentage = 100;
      toolResult.reasoning = `Overlapping capability with ${keeperLabel} — terminate this duplicate to claw back ${formatUsd(
        toolResult.currentMonthlyCost
      )}/mo without sacrificing coverage.`;

      totalOptimizedMonthlySpend -= previousOptimized;
      toolResult.recommendedAction =
        buildRecommendedAction(toolResult) ?? toolResult.recommendedAction;
    });
  }

  detectCrossCategory(toolResults, recommendations);

  totalOptimizedMonthlySpend = roundCurrency(totalOptimizedMonthlySpend);
  totalCurrentMonthlySpend = roundCurrency(totalCurrentMonthlySpend);

  const totalMonthlySavings = roundCurrency(
    totalCurrentMonthlySpend - totalOptimizedMonthlySpend
  );
  const totalAnnualSavings = roundCurrency(totalMonthlySavings * 12);
  const savingsPercentage =
    totalCurrentMonthlySpend > 0
      ? (totalMonthlySavings / totalCurrentMonthlySpend) * 100
      : 0;

  return {
    currency: "USD",
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

const IDE_WITH_BUILTIN_CHAT: Record<string, string> = {
  cursor: "Cursor already routes frontier models inline",
  copilot: "GitHub Copilot chat ships frontier models beside the IDE",
};

function detectCrossCategory(
  toolResults: ToolAuditResult[],
  recommendations: string[]
): void {
  const ideSlugs = toolResults
    .filter((t) => ["cursor", "copilot"].includes(t.toolSlug))
    .map((t) => t.toolSlug);
  const chatbotSlugs = toolResults
    .filter((t) => ["claude", "chatgpt"].includes(t.toolSlug))
    .map((t) => t.toolSlug);

  for (const ide of ideSlugs) {
    const builtIn = IDE_WITH_BUILTIN_CHAT[ide];
    if (!builtIn) continue;

    for (const chatbot of chatbotSlugs) {
      const chatResult = toolResults.find((t) => t.toolSlug === chatbot);
      if (!chatResult || chatResult.recommendedPlan === "Cancel / Consolidate")
        continue;

      const individualPlans = ["pro", "plus"];
      if (individualPlans.includes(chatResult.currentPlan)) {
        chatResult.crossCategoryNote = `${builtIn}—if ${chatResult.toolName} is only powering coding QA, consolidate into the IDE tier you already finance.`;
        recommendations.push(
          `Check whether ${getToolName(ide)} satisfies the ${chatResult.toolName} use case before renewing both.`,
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

  const ides = ["cursor", "copilot"].filter((toolSlug) =>
    toolSlugs.includes(toolSlug)
  );
  if (ides.length > 1) {
    let sortedIdes = ides;
    if (toolResults) {
      sortedIdes = [...ides].sort((a, b) => {
        const costA =
          toolResults.find((t) => t.toolSlug === a)?.currentMonthlyCost ?? 0;
        const costB =
          toolResults.find((t) => t.toolSlug === b)?.currentMonthlyCost ?? 0;
        return costA - costB;
      });
    }
    overlaps.push({
      tools: sortedIdes,
      category: "ide",
      recommendation: `You pay for overlapping IDE assistants (${sortedIdes
        .map((s) => getToolName(s))
        .join(" + ")}). Standardizing on ${getToolName(
        sortedIdes[0]!
      )} removes duplicate per-seat SaaS.`,
    });
  }

  const chatbots = ["chatgpt", "claude"].filter((toolSlug) =>
    toolSlugs.includes(toolSlug)
  );
  if (chatbots.length > 1) {
    let sortedChatbots = chatbots;
    if (toolResults) {
      sortedChatbots = [...chatbots].sort((a, b) => {
        const costA =
          toolResults.find((t) => t.toolSlug === a)?.currentMonthlyCost ?? 0;
        const costB =
          toolResults.find((t) => t.toolSlug === b)?.currentMonthlyCost ?? 0;
        return costA - costB;
      });
    }
    overlaps.push({
      tools: sortedChatbots,
      category: "chatbot",
      recommendation: `Two premium frontier chat SKUs (${sortedChatbots
        .map((s) => getToolName(s))
        .join(" + ")}) seldom earn their keep concurrently—keeping ${getToolName(
        sortedChatbots[0]!
      )} and cancelling duplicate coverage is lowest risk.`,
    });
  }

  return overlaps;
}
