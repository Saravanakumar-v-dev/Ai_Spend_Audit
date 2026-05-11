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
    
    // Smart overlap: Copilot Enterprise (Rs 3,680) is CHEAPER than Cursor Teams (Rs 3,775)
    // So Copilot is kept, Cursor is cancelled
    expect(result.toolResults.find(t => t.toolSlug === "cursor")?.recommendedPlan).toBe("Cancel / Consolidate");
    // Copilot is kept (cheaper IDE) — gets downgraded by small-team rule to business
    const copilotResult = result.toolResults.find(t => t.toolSlug === "copilot");
    expect(copilotResult?.monthlySavings).toBeGreaterThan(0);

    // Smart overlap: Claude Team Premium (Rs 14,156) is CHEAPER than ChatGPT Pro (Rs 18,874)
    // So Claude is kept (downgraded to Pro by small-team rule), ChatGPT is cancelled
    const claudeResult = result.toolResults.find(t => t.toolSlug === "claude");
    expect(claudeResult?.recommendedPlan).not.toBe("Cancel / Consolidate");
    expect(claudeResult?.monthlySavings).toBeGreaterThan(0);
    // ChatGPT is cancelled (more expensive chatbot)
    expect(result.toolResults.find(t => t.toolSlug === "chatgpt")?.recommendedPlan).toBe("Cancel / Consolidate");
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

  // ── NEW FEATURE TESTS ─────────────────────────────────────────────

  it("suggests annual billing when monthly is more expensive", async () => {
    const input: AuditFormData = {
      companyName: "AnnualTest",
      teamSize: 5,
      email: "test@annual.com",
      tools: [
        { toolSlug: "claude", planName: "team_standard", quantity: 5, billingCycle: "monthly" },
      ],
    };

    const result = await calculateAudit(input);

    // Claude Team Standard: monthly Rs 2,831.10/seat, annual Rs 2,359.25/seat
    // Monthly cost: 2831.10 × 5 = Rs 14,155.50
    // Annual cost:  2359.25 × 5 = Rs 11,796.25
    expect(result.totalCurrentMonthlySpend).toBeCloseTo(14155.5, 0);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(11796.25, 0);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    expect(result.toolResults[0].recommendedPlan).toContain("annual billing");
  });

  it("detects unused seats and suggests right-sizing", async () => {
    const input: AuditFormData = {
      companyName: "SeatWaste",
      teamSize: 20,
      email: "test@seatwaste.com",
      tools: [
        {
          toolSlug: "copilot",
          planName: "business",
          quantity: 20,
          billingCycle: "monthly",
          activeUsers: 12,
        },
      ],
    };

    const result = await calculateAudit(input);

    // Copilot Business: Rs 1,793.03/seat
    // Current: 20 seats = Rs 35,860.60
    // Right-sized: 12 seats = Rs 21,516.36
    expect(result.totalCurrentMonthlySpend).toBeCloseTo(35860.6, 0);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(21516.36, 0);
    expect(result.toolResults[0].recommendedPlan).toContain("12 seats");
    expect(result.toolResults[0].reasoning).toContain("8 unused seats");
  });

  it("suggests cheaper API model for right-sizing", async () => {
    const input: AuditFormData = {
      companyName: "APIHeavy",
      teamSize: 3,
      email: "test@apiheavy.com",
      tools: [
        {
          toolSlug: "api_anthropic_sonnet",
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

    // Sonnet: (10M × 283.11 + 2M × 1415.55) / 1M = 2831.1 + 2831.1 = ~5662
    // Haiku:  (10M × 75.5 + 2M × 377.48) / 1M   = 755 + 754.96 = ~1510
    expect(result.totalMonthlySavings).toBeGreaterThan(3000); // ~Rs 4152 savings
    expect(result.toolResults[0].recommendedPlan).toContain("Haiku");
    expect(result.toolResults[0].reasoning).toContain("routine tasks");
  });

  it("adds cross-category note when IDE + standalone chatbot overlap", async () => {
    const input: AuditFormData = {
      companyName: "CrossCat",
      teamSize: 1,
      email: "test@crosscat.com",
      tools: [
        { toolSlug: "cursor", planName: "pro", quantity: 1, billingCycle: "monthly" },
        { toolSlug: "claude", planName: "pro", quantity: 1, billingCycle: "monthly" },
      ],
    };

    const result = await calculateAudit(input);

    // Claude Pro should get a cross-category note because Cursor includes Claude Sonnet
    const claudeResult = result.toolResults.find(t => t.toolSlug === "claude");
    expect(claudeResult?.crossCategoryNote).toBeDefined();
    expect(claudeResult?.crossCategoryNote).toContain("Cursor");
    // Should also add a recommendation
    expect(result.recommendations.some(r => r.includes("Cursor") && r.includes("Claude"))).toBe(true);
  });

  it("smart overlap keeps the cheaper tool", async () => {
    const input: AuditFormData = {
      companyName: "SmartOverlap",
      teamSize: 5,
      email: "test@smart.com",
      tools: [
        // Cursor Pro is flat Rs 1,887 (not per-seat)
        { toolSlug: "cursor", planName: "pro", quantity: 1, billingCycle: "monthly" },
        // Copilot Business is Rs 1,793/seat × 5 = Rs 8,965
        { toolSlug: "copilot", planName: "business", quantity: 5, billingCycle: "monthly" },
      ],
    };

    const result = await calculateAudit(input);

    // Cursor Pro (Rs 1,887) is cheaper than Copilot Business (Rs 8,965)
    // So Cursor should be KEPT and Copilot CANCELLED
    const cursorResult = result.toolResults.find(t => t.toolSlug === "cursor");
    const copilotResult = result.toolResults.find(t => t.toolSlug === "copilot");
    
    expect(cursorResult?.recommendedPlan).not.toBe("Cancel / Consolidate");
    expect(copilotResult?.recommendedPlan).toBe("Cancel / Consolidate");
  });
});
