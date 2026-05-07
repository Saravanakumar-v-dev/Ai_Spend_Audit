/**
 * Zod Validation Schemas — AI Spend Audit
 *
 * Shared validation schemas used on both client (form) and server (API route).
 * This ensures a single source of truth for data shape and constraints.
 */

import { z } from "zod";

// ============================================================
// Tool & Plan Enums
// ============================================================

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

// ============================================================
// Individual Tool Selection Schema
// ============================================================

/**
 * Represents one AI tool selected by the user, including their plan
 * and quantity (seats or estimated monthly token usage).
 */
export const ToolSelectionSchema = z.object({
  toolSlug: z
    .string()
    .min(1, "Tool slug is required")
    .regex(/^[a-z0-9_]+$/, "Tool slug must be lowercase alphanumeric with underscores"),
  planName: z.string().min(1, "Plan name is required"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(10000, "Quantity seems unreasonably high"),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
  // For API tools: estimated monthly token usage
  estimatedMonthlyTokens: z
    .object({
      inputTokens: z.number().min(0).optional(),
      outputTokens: z.number().min(0).optional(),
    })
    .optional(),
});
export type ToolSelection = z.infer<typeof ToolSelectionSchema>;

// ============================================================
// Audit Form Schema (Client → Server)
// ============================================================

/**
 * The complete form payload submitted by the user.
 * Validated on both client (for UX) and server (for security).
 */
export const AuditFormSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name is too long")
    .trim(),
  teamSize: z
    .number()
    .int("Team size must be a whole number")
    .min(1, "Team size must be at least 1")
    .max(10000, "Team size seems unreasonably high"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email is too long")
    .trim()
    .toLowerCase(),
  tools: z
    .array(ToolSelectionSchema)
    .min(1, "Please select at least one AI tool")
    .max(20, "Too many tools selected"),
});
export type AuditFormData = z.infer<typeof AuditFormSchema>;

// ============================================================
// Audit Result Schema (Engine Output)
// ============================================================

/**
 * The computed output of the audit engine.
 * Stored as JSONB in the `audits` table.
 *
 * NOTE: Do not implement the engine logic yet.
 * This schema defines the expected output shape only.
 */
export const ToolAuditResultSchema = z.object({
  toolSlug: z.string(),
  toolName: z.string(),
  currentPlan: z.string(),
  currentMonthlyCost: z.number(),
  recommendedPlan: z.string().optional(),
  recommendedMonthlyCost: z.number().optional(),
  monthlySavings: z.number(),
  savingsPercentage: z.number(),
  reasoning: z.string(),
  isOverlap: z.boolean().default(false),
  overlapWith: z.string().optional(),
});
export type ToolAuditResult = z.infer<typeof ToolAuditResultSchema>;

export const AuditResultSchema = z.object({
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
