/**
 * Supabase Client — AI Spend Audit
 *
 * Creates Supabase clients lazily (on first use) to prevent crashes
 * when environment variables are missing during development.
 *
 * Environment variables must be set in .env.local (see .env.example).
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Public client — for read operations (e.g., fetching audit reports).
 * Uses the anon key, subject to Row Level Security policies.
 *
 * Throws at call time (not import time) if env vars are missing.
 */
export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable"
    );
  }

  _supabase = createClient(supabaseUrl, supabasePublishableKey);
  return _supabase;
}

/**
 * Service client — for write operations (e.g., inserting audit results).
 * Uses the service role key, bypasses RLS. Server-side only.
 *
 * Returns null if the service role key is not configured.
 * ⚠️ NEVER expose this client to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_supabaseAdmin) return _supabaseAdmin;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log("[supabase] Service role key not configured — admin client unavailable.");
    return null;
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _supabaseAdmin;
}

// Legacy exports for backward compatibility (lazy wrappers)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});

export const supabaseAdmin = supabaseServiceKey
  ? new Proxy({} as SupabaseClient, {
      get(_, prop) {
        const admin = getSupabaseAdmin();
        if (!admin) throw new Error("Supabase admin client not available");
        return Reflect.get(admin, prop);
      },
    })
  : null;
