import { describe, it, expect } from "vitest";
import { calculateAudit } from "./audit-engine";
import { AuditFormData } from "./validators";

describe("Audit Engine calculateAudit", () => {
  it("1. Base case: Normal team sizing and standard Pro tools", async () => {
    const input: AuditFormData = {
      companyName: "Acme",
      teamSize: 10,
      email: "test@acme.com",
      tools: [
        { toolSlug: "cursor", planName: "teams", quantity: 10, billingCycle: "monthly" },
      ],
    };
    
    // Cursor Teams is $40/user. 10 * 40 = 400.
    const result = await calculateAudit(input);
    expect(result.totalCurrentMonthlySpend).toBe(400);
    // Team of 10 -> not overkill, no enterprise discount
    expect(result.totalOptimizedMonthlySpend).toBe(400);
    expect(result.totalMonthlySavings).toBe(0);
  });

  it("2. Overkill scenario: A team of 2 using Copilot Business", async () => {
    const input: AuditFormData = {
      companyName: "Startup",
      teamSize: 2,
      email: "test@startup.com",
      tools: [
        { toolSlug: "copilot", planName: "business", quantity: 2, billingCycle: "monthly" },
      ],
    };

    // Copilot Business is $19/user. 2 * 19 = 38.
    // Overkill rule applies. Should suggest Individual ($10/user). 2 * 10 = 20.
    const result = await calculateAudit(input);
    expect(result.totalCurrentMonthlySpend).toBe(38);
    expect(result.totalOptimizedMonthlySpend).toBe(20);
    expect(result.totalMonthlySavings).toBe(18);
    expect(result.toolResults[0].recommendedPlan).toBe("individual");
  });

  it("3. Credex Discount: A massive enterprise team using Cursor Enterprise", async () => {
    const input: AuditFormData = {
      companyName: "BigCorp",
      teamSize: 1000,
      email: "test@bigcorp.com",
      tools: [
        { toolSlug: "copilot", planName: "enterprise", quantity: 1000, billingCycle: "monthly" },
      ],
    };

    // Copilot Enterprise is $39/user. 1000 * 39 = 39000.
    // Credex 20% discount = 39000 * 0.8 = 31200. Savings = 7800.
    const result = await calculateAudit(input);
    expect(result.totalCurrentMonthlySpend).toBe(39000);
    expect(result.totalOptimizedMonthlySpend).toBe(31200);
    expect(result.totalMonthlySavings).toBe(7800);
    expect(result.toolResults[0].recommendedPlan).toContain("Credex Discount");
  });

  it("4. Alternative suggestion: A user paying for ChatGPT Pro", async () => {
    const input: AuditFormData = {
      companyName: "Solo",
      teamSize: 1,
      email: "test@solo.com",
      tools: [
        { toolSlug: "chatgpt", planName: "pro", quantity: 1, billingCycle: "monthly" },
      ],
    };

    // ChatGPT Pro is $100.
    // Rule suggests Plus at $20. Savings = 80.
    const result = await calculateAudit(input);
    expect(result.totalCurrentMonthlySpend).toBe(100);
    expect(result.totalOptimizedMonthlySpend).toBe(20);
    expect(result.totalMonthlySavings).toBe(80);
    expect(result.toolResults[0].recommendedPlan).toBe("plus");
    expect(result.recommendations).toContain("Switching from ChatGPT Pro to Plus saves $80/mo per user with minimal impact for mixed use cases.");
  });

  it("5. Edge case: $0 spend (Free plans) / Massive teams", async () => {
    const input: AuditFormData = {
      companyName: "FreeCorp",
      teamSize: 50000,
      email: "test@freecorp.com",
      tools: [
        { toolSlug: "cursor", planName: "hobby", quantity: 50000, billingCycle: "monthly" },
      ],
    };

    // Assuming Hobby is 0 or undefined, should fallback safely. 
    // Wait, PRICING_DB doesn't have "hobby". So currentCost = 0.
    const result = await calculateAudit(input);
    expect(result.totalCurrentMonthlySpend).toBe(0);
    expect(result.totalOptimizedMonthlySpend).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsPercentage).toBe(0); // Should not divide by zero and return NaN
  });
});
