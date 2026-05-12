import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabasePublicKey,
  getSupabasePublicUrl,
} from "@/lib/supabase-env";

export const createClient = () => {
  const supabaseUrl = getSupabasePublicUrl();
  const supabaseKey = getSupabasePublicKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing or invalid Supabase public environment variables"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
