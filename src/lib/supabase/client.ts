"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { SUPABASE_TIMEOUT_MS, timeoutFetch } from "./fetch";

/** Browser-side Supabase client (OAuth redirects, client widgets). */
export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { fetch: timeoutFetch(SUPABASE_TIMEOUT_MS.browser) },
  });
}
