import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";
import { SUPABASE_TIMEOUT_MS, timeoutFetch } from "./fetch";

/**
 * Service-role client for trusted server-side operations
 * (Telegram auth, moderation). Never expose to the browser.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error("Supabase admin credentials are not configured");
  }
  return createSupabaseClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: timeoutFetch(SUPABASE_TIMEOUT_MS.admin) },
  });
}
