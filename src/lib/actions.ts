"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { findCategory } from "./categories";
import { createAdminClient } from "./supabase/admin";
import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "./supabase/config";
import { createClient } from "./supabase/server";
import { slugify } from "./utils";

/** Origin текущего запроса: работает на vercel.app, кастомном домене и localhost. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host");
  return (
    h.get("origin") ??
    (forwardedHost
      ? `${h.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
  );
}

export interface ActionResult {
  ok?: boolean;
  error?: "demoMode" | "loginRequired" | "generic" | "validation";
  votes?: number;
  voted?: boolean;
  bookmarked?: boolean;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function toggleVote(productId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };

  const { data: existing } = await supabase
    .from("votes")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("votes")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", user.id);
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ product_id: productId, user_id: user.id });
    if (error) return { error: "generic" };
  }

  const { data: product } = await supabase
    .from("products")
    .select("votes_count")
    .eq("id", productId)
    .single();

  revalidatePath("/", "layout");
  return {
    ok: true,
    voted: !existing,
    votes: product?.votes_count ?? 0,
  };
}

export async function toggleBookmark(productId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("bookmarks")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", user.id);
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .insert({ product_id: productId, user_id: user.id });
    if (error) return { error: "generic" };
  }

  revalidatePath("/bookmarks");
  return { ok: true, bookmarked: !existing };
}

export async function addComment(
  productId: string,
  content: string,
  parentId?: string | null
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };

  const text = content.trim();
  if (!text || text.length > 2000) return { error: "validation" };

  const { error } = await supabase.from("comments").insert({
    product_id: productId,
    user_id: user.id,
    parent_id: parentId ?? null,
    content: text,
  });
  if (error) return { error: "generic" };

  revalidatePath("/", "layout");
  return { ok: true };
}

export interface SubmitState {
  ok?: boolean;
  error?: "demoMode" | "loginRequired" | "validation" | "generic";
}

export async function submitProduct(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };

  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const telegram = String(formData.get("telegram") ?? "").trim();
  const logo = String(formData.get("logo") ?? "").trim();
  const categorySlug = String(formData.get("category") ?? "").trim();

  const category = findCategory(categorySlug);
  if (!name || name.length > 60 || !tagline || tagline.length > 140 || !category) {
    return { error: "validation" };
  }
  const urlOk = (u: string) => !u || /^https?:\/\/.+/.test(u);
  if (!urlOk(website) || !urlOk(telegram) || !urlOk(logo)) {
    return { error: "validation" };
  }

  const base = slugify(name);
  let slug = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: taken } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!taken) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { error } = await supabase.from("products").insert({
    slug,
    name,
    tagline,
    description: description || null,
    website_url: website || null,
    telegram_url: telegram || null,
    logo_url: logo || null,
    category_id: category.id,
    created_by: user.id,
    status: "pending",
  });
  if (error) return { error: "generic" };

  revalidatePath("/", "layout");
  return { ok: true };
}

export interface SubscribeState {
  ok?: boolean;
  error?: "generic" | "validation" | "demoMode";
}

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = String(formData.get("locale") ?? "uz");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "validation" };
  if (!isSupabaseConfigured()) return { error: "demoMode" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscribers")
    .insert({ email, locale });
  // 23505 = already subscribed; treat as success.
  if (error && error.code !== "23505") return { error: "generic" };
  return { ok: true };
}

export async function setProductStatus(
  productId: string,
  status: "approved" | "rejected",
  reason?: string
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") return { error: "loginRequired" };

  const { error } = await supabase
    .from("products")
    .update({
      status,
      launched_at: new Date().toISOString(),
      // Причина видна автору на странице продукта; при одобрении очищается.
      rejection_reason:
        status === "rejected" ? (reason ?? "").trim().slice(0, 500) || null : null,
    })
    .eq("id", productId);
  if (error) return { error: "generic" };

  revalidatePath("/", "layout");
  return { ok: true };
}

export interface MagicLinkState {
  ok?: boolean;
  error?: "validation" | "generic" | "demoMode";
}

export async function sendMagicLink(
  _prev: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "validation" };
  if (!isSupabaseConfigured()) return { error: "demoMode" };

  const locale = String(formData.get("locale") ?? "uz");
  const supabase = await createClient();
  const site = await requestOrigin();
  const localePrefix = locale !== "uz" ? `/${locale}` : "";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${site}/api/auth/confirm${localePrefix ? `?locale=${locale}` : ""}`,
      shouldCreateUser: true,
    },
  });
  if (error) return { error: "generic" };
  return { ok: true };
}

export interface PasswordLoginState {
  ok?: boolean;
  error?: "validation" | "credentials" | "generic" | "demoMode";
}

/**
 * Вход по логину/email и паролю. «Запомнить меня» управляет временем жизни
 * cookie сессии: без галочки cookie сессионная и исчезает при закрытии браузера.
 */
export async function signInWithPassword(
  _prev: PasswordLoginState,
  formData: FormData
): Promise<PasswordLoginState> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };

  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  const digest = formData.get("digest") === "on";
  if (!identifier || password.length < 6) return { error: "validation" };

  let email = identifier.toLowerCase();
  if (!email.includes("@")) {
    // Логин → email через service-role (email хранится только в auth.users).
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("username", identifier.toLowerCase())
        .maybeSingle();
      if (!profile) return { error: "credentials" };
      const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
      if (!authUser.user?.email) return { error: "credentials" };
      email = authUser.user.email;
    } catch {
      // Без SUPABASE_SERVICE_ROLE_KEY вход возможен только по email.
      return { error: "credentials" };
    }
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookieOptions: remember ? { maxAge: 60 * 60 * 24 * 365 } : { maxAge: undefined },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) =>
        list.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: "credentials" };

  if (digest && data.user) {
    await supabase
      .from("profiles")
      .update({ digest_opt_in: true })
      .eq("id", data.user.id);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export interface PasswordResetState {
  ok?: boolean;
  error?: "validation" | "generic" | "demoMode";
}

export async function requestPasswordReset(
  _prev: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "validation" };
  if (!isSupabaseConfigured()) return { error: "demoMode" };

  const supabase = await createClient();
  const site = await requestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/api/auth/confirm?next=/reset-password`,
  });
  if (error) return { error: "generic" };
  return { ok: true };
}

export async function updatePassword(
  _prev: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "validation" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "generic" };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
