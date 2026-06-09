import { createHash, createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const AUTH_TTL_SECONDS = 86_400;

/** Verifies the signature of Telegram Login Widget data. */
function verifyTelegramAuth(
  params: URLSearchParams,
  botToken: string
): boolean {
  const hash = params.get("hash");
  if (!hash) return false;

  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== "hash" && key !== "locale") pairs.push(`${key}=${value}`);
  });
  pairs.sort();

  const secretKey = createHash("sha256").update(botToken).digest();
  const computed = createHmac("sha256", secretKey)
    .update(pairs.join("\n"))
    .digest("hex");

  if (computed !== hash) return false;

  const authDate = Number(params.get("auth_date") ?? 0);
  return Date.now() / 1000 - authDate < AUTH_TTL_SECONDS;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const locale = params.get("locale");
  const homePath = locale && locale !== "uz" ? `/${locale}` : "/";
  const home = new URL(homePath, request.url);
  const loginUrl = new URL(
    `${homePath === "/" ? "" : homePath}/login?error=telegram`,
    request.url
  );

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !isSupabaseConfigured()) {
    return NextResponse.redirect(loginUrl);
  }
  if (!verifyTelegramAuth(params, botToken)) {
    return NextResponse.redirect(loginUrl);
  }

  const telegramId = Number(params.get("id"));
  const firstName = params.get("first_name") ?? "";
  const lastName = params.get("last_name") ?? "";
  const username = params.get("username");
  const photoUrl = params.get("photo_url");
  if (!telegramId) return NextResponse.redirect(loginUrl);

  const admin = createAdminClient();
  // Deterministic service address: Telegram does not share user emails.
  const email = `tg-${telegramId}@telegram.techradar.uz`;
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  let userId = existingProfile?.id as string | undefined;

  if (!userId) {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          username: username ?? `tg${telegramId}`,
          avatar_url: photoUrl,
          telegram_id: telegramId,
        },
      });
    if (createError || !created.user) {
      return NextResponse.redirect(loginUrl);
    }
    userId = created.user.id;
  }

  // Keep the profile in sync with the latest Telegram data.
  const { data: usernameTaken } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username ?? "")
    .neq("id", userId)
    .maybeSingle();
  const safeUsername =
    username && !usernameTaken ? username : `tg${telegramId}`;

  await admin.from("profiles").upsert({
    id: userId,
    username: safeUsername,
    full_name: fullName || safeUsername,
    avatar_url: photoUrl,
    telegram_id: telegramId,
    telegram_username: username,
  });

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(home);
  const supabase = await createClient();
  const { error: otpError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (otpError) {
    return NextResponse.redirect(loginUrl);
  }
  return response;
}
