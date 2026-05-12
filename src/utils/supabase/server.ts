import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  getSupabasePublicKey,
  getSupabasePublicUrl,
} from "@/lib/supabase-env";

export const createClient = (
  cookieStore: Awaited<ReturnType<typeof cookies>>
) => {
  const supabaseUrl = getSupabasePublicUrl();
  const supabaseKey = getSupabasePublicKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing or invalid Supabase public environment variables"
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components cannot set cookies directly. Middleware refreshes sessions.
        }
      },
    },
  });
};
