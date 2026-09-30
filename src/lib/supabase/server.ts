import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { SUPABASE_TIMEOUT_MS, timeoutFetch } from "./fetch";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { fetch: timeoutFetch(SUPABASE_TIMEOUT_MS.server) },
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
          // Called from a Server Component — session refresh is handled by proxy.
        }
      },
    },
  });
}

/**
 * The signed-in user, or null.
 *
 * `auth.getUser()` rejects when its request times out or the project is
 * unreachable — unlike `.from()` queries, which resolve with an error. Callers
 * want to fall back to "not signed in" rather than crash the route.
 */
export async function getUserOrNull(
  client: Awaited<ReturnType<typeof createClient>>
) {
  try {
    const { data } = await client.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}
