import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { SUPABASE_TIMEOUT_MS, timeoutFetch } from "./fetch";

export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { fetch: timeoutFetch(SUPABASE_TIMEOUT_MS.proxy) },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refreshes the auth token if needed and syncs cookies onto the response.
  // This runs on every navigation, so a database that is down must degrade
  // into "not signed in" rather than throwing and 500-ing the whole route.
  try {
    await supabase.auth.getUser();
  } catch {
    // Timed out or unreachable — carry on without a refreshed session.
  }

  return response;
}
