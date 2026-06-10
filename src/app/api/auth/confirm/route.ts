import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { applyDigestOptIn } from "@/lib/supabase/digest";

export const dynamic = "force-dynamic";

/** Completes email magic-link sign-in (и переход на смену пароля). */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;
  const locale = searchParams.get("locale");
  const localePrefix = locale && locale !== "uz" ? `/${locale}` : "";
  const next = searchParams.get("next") ?? `${localePrefix}/`;

  if (tokenHash && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      const response = NextResponse.redirect(new URL(next, request.url));
      await applyDigestOptIn(request, response, supabase, data.user?.id);
      return response;
    }
  }
  return NextResponse.redirect(new URL(`${localePrefix}/login?error=email`, request.url));
}
