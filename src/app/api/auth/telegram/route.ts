import { NextResponse } from "next/server";
import { validateInitData } from "@/lib/telegram-auth";
import { setSessionCookie } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "auth_disabled" }, { status: 501 });
  }

  let initData: string;
  try {
    ({ initData } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const user = validateInitData(initData, botToken);
  if (!user) {
    return NextResponse.json({ error: "invalid_init_data" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("tg_users").upsert(
      {
        id: user.id,
        first_name: user.firstName,
        username: user.username ?? null,
        photo_url: user.photoUrl ?? null,
        language_code: user.languageCode ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }

  setSessionCookie(user);
  return NextResponse.json({ user, storage: supabase ? "cloud" : "local" });
}
