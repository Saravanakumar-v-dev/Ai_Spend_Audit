/**
 * Supabase Client — AI Spend Audit
 *
 * Creates a singleton Supabase client for use in Server Components
 * and API routes. Uses the service role key for write operations.
 *
 * Environment variables must be set in .env.local (see .env.example).
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

/**
 * Public client — for read operations (e.g., fetching audit reports).
 * Uses the anon key, subject to Row Level Security policies.
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || ""
);

/**
 * Service client — for write operations (e.g., inserting audit results).
 * Uses the service role key, bypasses RLS. Server-side only.
 *
 * ⚠️ NEVER expose this client to the browser.
 */
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
