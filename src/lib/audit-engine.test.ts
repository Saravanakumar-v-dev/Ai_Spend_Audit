import { describe, expect, it } from "vitest";
import { calculateAudit } from "./audit-engine";
import type { AuditFormData } from "./validators";

describe("calculateAudit · USD deterministic engine", () => {
  it("returns USD currency for Cursor Business billed seats", async () => {
    const input: AuditFormData = {
      email: "test@cursor.com",
      teamSize: 10,
      tools: [
        {
          toolSlug: "cursor",
          planName: "business",
          quantity: 10,
          seatCount: 10,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.currency).toBe("USD");
    expect(result.totalCurrentMonthlySpend).toBe(400);
    expect(result.totalMonthlySavings).toBe(0);
  });

  it("downshifts Copilot Business to Individual licenses for duo teams", async () => {
    const input: AuditFormData = {
      email: "test@startup.com",
      teamSize: 2,
      tools: [
        {
          toolSlug: "copilot",
          planName: "business",
          quantity: 2,
          seatCount: 2,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBeCloseTo(38, 5);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(20, 5);
    expect(result.totalMonthlySavings).toBeCloseTo(18, 5);
    expect(result.toolResults[0].recommendedPlan).toBe("individual");
  });

  it("applies Saravanakumar negotiation rule on Enterprise SKUs (~20%)", async () => {
    const input: AuditFormData = {
      email: "test@corp.com",
      teamSize: 1000,
      tools: [
        {
          toolSlug: "copilot",
          planName: "enterprise",
          quantity: 1000,
          seatCount: 1000,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBe(39000);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(31200, 2);
    expect(result.totalMonthlySavings).toBeCloseTo(7800, 2);
    expect(result.toolResults[0].recommendedPlan).toContain("negotiated");
  });

  it("models Gemini API throughput with frontier + Flash savings", async () => {
    const input: AuditFormData = {
      email: "test@gemini-api.com",
      teamSize: 5,
      tools: [
        {
          toolSlug: "api_gemini_3_pro",
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

    expect(result.totalCurrentMonthlySpend).toBeGreaterThan(
      result.totalOptimizedMonthlySpend
    );
    expect(result.toolResults[0].recommendedPlan ?? "").toContain("Flash");
  });

  it("smart overlap prefers cheaper IDE assistant monthly burn", async () => {
    const input: AuditFormData = {
      email: "test@overlap.com",
      teamSize: 6,
      tools: [
        {
          toolSlug: "copilot",
          planName: "business",
          quantity: 6,
          seatCount: 6,
          billingCycle: "monthly",
        },
        {
          toolSlug: "cursor",
          planName: "pro",
          quantity: 1,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    const cursorRow = result.toolResults.find((t) => t.toolSlug === "cursor");
    expect(cursorRow?.recommendedPlan).not.toBe("Cancel / Consolidate");
    const copilotRow = result.toolResults.find((t) => t.toolSlug === "copilot");
    expect(copilotRow?.recommendedPlan).toBe("Cancel / Consolidate");
  });

  it("reports zero deterministic savings when already aligned", async () => {
    const input: AuditFormData = {
      email: "solo@corp.com",
      teamSize: 1,
      tools: [
        {
          toolSlug: "cursor",
          planName: "pro",
          quantity: 1,
          billingCycle: "monthly",
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBe(20);
    expect(result.totalOptimizedMonthlySpend).toBe(20);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.toolResults[0].recommendedPlan).toBeUndefined();
    expect(result.toolResults[0].recommendedAction).toMatch(/existing/i);
  });

  it("detects unused Copilot Business seats", async () => {
    const input: AuditFormData = {
      email: "test@seats.com",
      teamSize: 20,
      tools: [
        {
          toolSlug: "copilot",
          planName: "business",
          quantity: 20,
          seatCount: 20,
          billingCycle: "monthly",
          activeUsers: 12,
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.totalCurrentMonthlySpend).toBeCloseTo(380, 2);
    expect(result.totalOptimizedMonthlySpend).toBeCloseTo(228, 2);
    expect(result.toolResults[0].recommendedPlan).toContain("12 seats");
  });

  it("uses reported USD invoice when provided", async () => {
    const input: AuditFormData = {
      email: "founder@team.com",
      teamSize: 5,
      tools: [
        {
          toolSlug: "chatgpt",
          planName: "team",
          quantity: 5,
          seatCount: 5,
          billingCycle: "monthly",
          reportedMonthlySpendUsd: 400,
        },
      ],
    };

    const result = await calculateAudit(input);

    expect(result.toolResults[0].currentMonthlyCost).toBe(400);
    expect(result.totalCurrentMonthlySpend).toBe(400);
  });
});
