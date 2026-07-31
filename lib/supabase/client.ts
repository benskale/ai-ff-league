"use client";

import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client (uses anon key, respects RLS)
// Env vars required:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  if (!client) {
    client = createClient(url, key);
  }

  return client;
}
