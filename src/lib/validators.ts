/**
 * Zod Validation Schemas - AI Spend Audit
 *
 * Shared validation schemas used on both client and server.
 */

import { z } from "zod";

export const ToolCategory = z.enum(["ide", "chatbot", "api", "ui_gen"]);
export type ToolCategory = z.infer<typeof ToolCategory>;

export const BillingModel = z.enum([
  "flat",
  "per_seat",
  "credit_based",
  "per_token",
  "hybrid",
]);
export type BillingModel = z.infer<typeof BillingModel>;

export const ToolSelectionSchema = z.object({
  toolSlug: z
    .string()
    .min(1, "Tool slug is required")
    .regex(
      /^[a-z0-9_]+$/,
      "Tool slug must be lowercase alphanumeric with underscores"
    ),
  planName: z.string().min(1, "Plan name is required"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(10000, "Quantity seems unreasonably high"),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
  estimatedMonthlyTokens: z
    .object({
      inputTokens: z.number().min(0).optional(),
      outputTokens: z.number().min(0).optional(),
    })
    .optional(),
  activeUsers: z
    .number()
    .int()
    .min(0, "Active users cannot be negative")
    .max(10000)
    .optional(),
  /** Billed seats/licenses for this row (per-seat tools). Falls back to quantity or team size in the engine. */
  seatCount: z
    .number()
    .int()
    .min(1)
    .max(10000)
    .optional(),
  /** When set, treat this as the invoice-truth current monthly spend (USD). */
  reportedMonthlySpendUsd: z
    .number()
    .min(0)
    .max(10_000_000)
    .optional(),
});
export type ToolSelection = z.infer<typeof ToolSelectionSchema>;

export const AuditFormSchema = z.object({
  companyName: z
    .string()
    .max(100, "Company name is too long")
    .trim()
    .optional(),
  role: z.string().max(100, "Role is too long").trim().optional(),
  teamSize: z
    .number()
    .int("Team size must be a whole number")
    .min(1, "Team size must be at least 1")
    .max(10000, "Team size seems unreasonably high")
    .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long")
    .trim()
    .toLowerCase(),
  primaryUseCase: z.enum(["coding", "writing", "data", "research", "mixed"]).optional(),
  tools: z
    .array(ToolSelectionSchema)
    .min(1, "Please select at least one AI tool")
    .max(20, "Too many tools selected"),
});
export type AuditFormData = z.infer<typeof AuditFormSchema>;

export const ToolAuditResultSchema = z.object({
  toolSlug: z.string(),
  toolName: z.string(),
  currentPlan: z.string(),
  currentMonthlyCost: z.number(),
  recommendedPlan: z.string().optional(),
  recommendedAction: z.string().optional(),
  recommendedMonthlyCost: z.number().optional(),
  monthlySavings: z.number(),
  savingsPercentage: z.number(),
  reasoning: z.string(),
  isOverlap: z.boolean().default(false),
  overlapWith: z.string().optional(),
  crossCategoryNote: z.string().optional(),
});
export type ToolAuditResult = z.infer<typeof ToolAuditResultSchema>;

export const AuditResultSchema = z.object({
  currency: z.literal("USD"),
  pricingReferenceDate: z.string(),
  totalCurrentMonthlySpend: z.number(),
  totalOptimizedMonthlySpend: z.number(),
  totalMonthlySavings: z.number(),
  totalAnnualSavings: z.number(),
  savingsPercentage: z.number(),
  toolResults: z.array(ToolAuditResultSchema),
  recommendations: z.array(z.string()),
  generatedAt: z.string().datetime(),
});
export type AuditResult = z.infer<typeof AuditResultSchema>;
