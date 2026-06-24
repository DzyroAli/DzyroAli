import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

const DIGEST_COOKIE = "tr_digest";

/**
 * Если на форме входа была отмечена подписка на дайджест, выбор доезжает
 * до колбэка через куку — включаем флаг в профиле и удаляем куку.
 */
export async function applyDigestOptIn(
  request: NextRequest,
  response: NextResponse,
  supabase: SupabaseClient,
  userId?: string | null
): Promise<void> {
  if (!userId || request.cookies.get(DIGEST_COOKIE)?.value !== "1") return;
  await supabase
    .from("profiles")
    .update({ digest_opt_in: true })
    .eq("id", userId);
  response.cookies.set(DIGEST_COOKIE, "", { maxAge: 0, path: "/" });
}
