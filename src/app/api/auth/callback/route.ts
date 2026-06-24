import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { applyDigestOptIn } from "@/lib/supabase/digest";

export const dynamic = "force-dynamic";

/** Завершает OAuth-вход (Google): обменивает код на сессию. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const locale = searchParams.get("locale");
  const localePrefix = locale && locale !== "uz" ? `/${locale}` : "";
  const next = searchParams.get("next") ?? `${localePrefix}/`;

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(new URL(next, request.url));
      await applyDigestOptIn(request, response, supabase, data.user?.id);
      return response;
    }
  }
  return NextResponse.redirect(new URL(`${localePrefix}/login?error=oauth`, request.url));
}
