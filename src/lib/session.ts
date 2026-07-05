import { createHmac, createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { TgUser } from "./types";

export const SESSION_COOKIE = "slaydchi_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface SessionPayload {
  user: TgUser;
  exp: number;
}

function secret(): string | null {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  return createHash("sha256").update(`slaydchibot:${token}`).digest("hex");
}

function sign(data: string, key: string): string {
  return createHmac("sha256", key).update(data).digest("base64url");
}

export function createSessionValue(user: TgUser): string | null {
  const key = secret();
  if (!key) return null;
  const payload: SessionPayload = { user, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, key)}`;
}

export function setSessionCookie(user: TgUser): boolean {
  const value = createSessionValue(user);
  if (!value) return false;
  cookies().set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // the app lives inside Telegram's WebView iframe
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return true;
}

export function getSessionUser(): TgUser | null {
  const key = secret();
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!key || !raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const expected = sign(body, key);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now() / 1000) return null;
    return payload.user;
  } catch {
    return null;
  }
}
