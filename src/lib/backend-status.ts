import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

export type BackendStatus = "demo" | "ok" | "unreachable";

/** A paused Supabase project doesn't refuse connections, it hangs. */
const HEALTH_TIMEOUT_MS = 3000;

/**
 * Whether the database is actually answering.
 *
 * Without this the app has a silent failure mode: when the Supabase env vars
 * are set but the project is paused or unreachable, `isSupabaseConfigured()`
 * is still true, so demo data never kicks in and every query quietly returns
 * nothing — the site renders empty with no explanation. Checked once per
 * request via `cache`.
 */
export const getBackendStatus = cache(async (): Promise<BackendStatus> => {
  if (!isSupabaseConfigured()) return "demo";

  try {
    const supabase = await createClient();
    const probe = supabase
      .from("categories")
      .select("id")
      .limit(1)
      .then(({ error }) => (error ? "unreachable" : "ok") as BackendStatus);

    const timeout = new Promise<BackendStatus>((resolve) =>
      setTimeout(() => resolve("unreachable"), HEALTH_TIMEOUT_MS)
    );

    return await Promise.race([probe, timeout]);
  } catch {
    return "unreachable";
  }
});
