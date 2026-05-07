/**
 * Pricing Data Access Layer — AI Spend Audit
 *
 * Provides functions to query pricing data from Supabase.
 * This module abstracts the database queries so the audit engine
 * can work with clean TypeScript interfaces.
 *
 * NOTE: Pricing data is stored in the `pricing_data` table in Supabase.
 * For the MVP, data is inserted manually via the Supabase dashboard
 * based on the verified prices in PRICING_DATA.md.
 */

import { supabase } from "./supabase";

// ============================================================
// Types
// ============================================================

export interface PricingEntry {
  id: number;
  toolSlug: string;
  toolName: string;
  vendor: string;
  category: "ide" | "chatbot" | "api" | "ui_gen";
  planName: string;
  priceMonthly: number;
  priceAnnualMonthly: number | null;
  billingModel: "flat" | "per_seat" | "credit_based" | "per_token" | "hybrid";
  tokenInput1m: number | null;
  tokenOutput1m: number | null;
  verifiedAt: string;
  sourceUrl: string;
  notes: string | null;
}

// ============================================================
// Queries
// ============================================================

/**
 * Fetch all pricing entries for a given list of tool slugs.
 *
 * @example
 * const prices = await getPricingForTools(["cursor_pro", "chatgpt_plus"]);
 */
export async function getPricingForTools(
  toolSlugs: string[]
): Promise<PricingEntry[]> {
  const { data, error } = await supabase
    .from("pricing_data")
    .select("*")
    .in("tool_slug", toolSlugs);

  if (error) {
    console.error("Error fetching pricing data:", error);
    throw new Error(`Failed to fetch pricing data: ${error.message}`);
  }

  return (data || []).map(mapRowToPricingEntry);
}

/**
 * Fetch all pricing entries, grouped by category.
 * Used for rendering the tool selector on the form.
 */
export async function getAllPricing(): Promise<PricingEntry[]> {
  const { data, error } = await supabase
    .from("pricing_data")
    .select("*")
    .order("category")
    .order("tool_name")
    .order("price_monthly");

  if (error) {
    console.error("Error fetching all pricing data:", error);
    throw new Error(`Failed to fetch pricing data: ${error.message}`);
  }

  return (data || []).map(mapRowToPricingEntry);
}

/**
 * Fetch pricing for a specific tool slug (e.g., "cursor_pro").
 */
export async function getPricingBySlug(
  toolSlug: string
): Promise<PricingEntry | null> {
  const { data, error } = await supabase
    .from("pricing_data")
    .select("*")
    .eq("tool_slug", toolSlug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("Error fetching pricing by slug:", error);
    throw new Error(`Failed to fetch pricing data: ${error.message}`);
  }

  return data ? mapRowToPricingEntry(data) : null;
}

// ============================================================
// Helpers
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRowToPricingEntry(row: any): PricingEntry {
  return {
    id: row.id,
    toolSlug: row.tool_slug,
    toolName: row.tool_name,
    vendor: row.vendor,
    category: row.category,
    planName: row.plan_name,
    priceMonthly: Number(row.price_monthly),
    priceAnnualMonthly: row.price_annual_monthly
      ? Number(row.price_annual_monthly)
      : null,
    billingModel: row.billing_model,
    tokenInput1m: row.token_input_1m ? Number(row.token_input_1m) : null,
    tokenOutput1m: row.token_output_1m ? Number(row.token_output_1m) : null,
    verifiedAt: row.verified_at,
    sourceUrl: row.source_url,
    notes: row.notes,
  };
}
