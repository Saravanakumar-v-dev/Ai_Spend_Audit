import { describe, expect, it } from "vitest";
import { calculateAudit } from "./audit-engine";
import type { AuditFormData } from "./validators";

describe("Audit Engine calculateAudit", () => {
  it("uses INR pricing for a standard team plan", async () => {
    const input: AuditFormData = {
      companyName: "Acme",
      teamSize: 10,
      email: "test@acme.com",
      tools: [
        {
          toolSlug: "cursor",
          planName: "teams",
          quantity: 10,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.currency).toBe("INR");
    expect(result.totalCurrentMonthlySpend).toBeCloseTo(37748, 2);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(37748, 2);
    expect(result.totalMonthlySavings).toBe(0);
  });

  it("finds a cheaper small-team alternative in INR", async () => {
    const input: AuditFormData = {
      companyName: "Startup",
      teamSize: 2,
      email: "test@startup.com",
      tools: [
        {
          toolSlug: "copilot",
          planName: "business",
          quantity: 2,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBeCloseTo(3586.06, 2);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(1887.4, 2);
    expect(result.totalMonthlySavings).toBeCloseTo(1698.66, 2);
    expect(result.toolResults[0].recommendedPlan).toBe("individual");
  });

  it("keeps the enterprise negotiation rule in INR", async () => {
    const input: AuditFormData = {
      companyName: "BigCorp",
      teamSize: 1000,
      email: "test@bigcorp.com",
      tools: [
        {
          toolSlug: "copilot",
          planName: "enterprise",
          quantity: 1000,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBeCloseTo(3680430, 2);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(2944344, 2);
    expect(result.totalMonthlySavings).toBeCloseTo(736086, 2);
    expect(result.toolResults[0].recommendedPlan).toContain(
      "Saravanakumar Discount"
    );
  });

  it("uses current INR pricing for ChatGPT Pro vs Plus", async () => {
    const input: AuditFormData = {
      companyName: "Solo",
      teamSize: 1,
      email: "test@solo.com",
      tools: [
        {
          toolSlug: "chatgpt",
          planName: "pro",
          quantity: 1,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBeCloseTo(18874, 2);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(1887.4, 2);
    expect(result.totalMonthlySavings).toBeCloseTo(16986.6, 2);
    expect(result.toolResults[0].recommendedPlan).toBe("plus");
    expect(result.recommendations[0]).toContain("Rs 16,987");
  });

  it("fails safely for unknown plans", async () => {
    const input: AuditFormData = {
      companyName: "FreeCorp",
      teamSize: 50000,
      email: "test@freecorp.com",
      tools: [
        {
          toolSlug: "cursor",
          planName: "hobby",
          quantity: 50000,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBe(0);
    expect(result.totalOptimizedMonthlySpend).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsPercentage).toBe(0);
  });

  it("uses per-million token pricing for API usage in INR", async () => {
    const input: AuditFormData = {
      companyName: "API Corp",
      teamSize: 8,
      email: "test@apicorp.com",
      tools: [
        {
          toolSlug: "api_openai_gpt5_4",
          planName: "api_usage",
          quantity: 1,
          billingCycle: "monthly",
          estimatedMonthlyTokens: {
            inputTokens: 10_000_000,
            outputTokens: 2_000_000,
          },
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBeCloseTo(5190.4, 2);
    expect(result.toolResults[0].toolName).toBe("OpenAI API (GPT-5.4)");
  });

  it("handles a user on all the most expensive tiers with only 1 seat", async () => {
    const input: AuditFormData = {
      companyName: "MoneyBurner",
      teamSize: 1,
      email: "burn@money.com",
      tools: [
        { toolSlug: "cursor", planName: "teams", quantity: 1, billingCycle: "monthly" },
        { toolSlug: "copilot", planName: "enterprise", quantity: 1, billingCycle: "monthly" },
        { toolSlug: "claude", planName: "team_premium", quantity: 1, billingCycle: "monthly" },
        { toolSlug: "chatgpt", planName: "pro", quantity: 1, billingCycle: "monthly" },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBeGreaterThan(result.totalOptimizedMonthlySpend);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    // Should downgrade cursor from teams to pro
    expect(result.toolResults.find(t => t.toolSlug === "cursor")?.recommendedPlan).toBe("pro");
    // Claude is the SECOND chatbot in detectOverlaps order ["chatgpt","claude"] — cancelled for consolidation
    const claudeResult = result.toolResults.find(t => t.toolSlug === "claude");
    expect(claudeResult?.recommendedPlan).toBe("Cancel / Consolidate");
    expect(claudeResult?.monthlySavings).toBeGreaterThan(0);
    // ChatGPT is the FIRST chatbot — kept, downgraded from Pro to Plus
    expect(result.toolResults.find(t => t.toolSlug === "chatgpt")?.recommendedPlan).toBe("plus");
  });

  it("handles a user who is already perfectly optimized", async () => {
    const input: AuditFormData = {
      companyName: "LeanStartup",
      teamSize: 1,
      email: "lean@startup.com",
      tools: [
        { toolSlug: "cursor", planName: "pro", quantity: 1, billingCycle: "monthly" },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBe(1887.4);
    expect(result.totalOptimizedMonthlySpend).toBe(1887.4);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsPercentage).toBe(0);
    expect(result.toolResults[0].recommendedPlan).toBeUndefined();
  });
});
