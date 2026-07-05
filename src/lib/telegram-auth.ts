import { createHmac, timingSafeEqual } from "crypto";
import type { TgUser } from "./types";

const MAX_AGE_SECONDS = 60 * 60 * 24; // initData older than 24h is rejected

/**
 * Validates Telegram Mini App initData as described in
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * Returns the authenticated user or null.
 */
export function validateInitData(initData: string, botToken: string): TgUser | null {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SECONDS) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "null");
    if (!user?.id) return null;
    return {
      id: user.id,
      firstName: user.first_name ?? "",
      username: user.username,
      photoUrl: user.photo_url,
      languageCode: user.language_code,
    };
  } catch {
    return null;
  }
}
