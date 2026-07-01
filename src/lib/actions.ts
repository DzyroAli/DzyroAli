"use server";

import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { findCategory } from "./categories";
import { isEmailConfigured, sendEmail } from "./email";
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
  error?: "demoMode" | "loginRequired" | "generic" | "validation" | "banned";
  votes?: number;
  voted?: boolean;
  bookmarked?: boolean;
  rating?: number;
  ratingAvg?: number;
  ratingCount?: number;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Проверяет, забанен ли пользователь (для блокировки действий). */
async function isBanned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("banned")
    .eq("id", userId)
    .maybeSingle();
  return Boolean((data as { banned?: boolean } | null)?.banned);
}

/** Текущий пользователь + флаг администратора (для admin-действий). */
async function requireAdmin(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string | null;
  isAdmin: boolean;
}> {
  const { supabase, user } = await requireUser();
  if (!user) return { supabase, userId: null, isAdmin: false };
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return {
    supabase,
    userId: user.id,
    isAdmin: (data as { role?: string } | null)?.role === "admin",
  };
}

export async function setUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  if (role !== "user" && role !== "admin") return { error: "validation" };
  const { supabase, userId: meId, isAdmin } = await requireAdmin();
  if (!meId || !isAdmin) return { error: "loginRequired" };
  if (userId === meId) return { error: "validation" }; // свою роль не меняем

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) return { error: "generic" };

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserBanned(
  userId: string,
  banned: boolean
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, userId: meId, isAdmin } = await requireAdmin();
  if (!meId || !isAdmin) return { error: "loginRequired" };
  if (userId === meId) return { error: "validation" }; // себя не банить

  const { error } = await supabase
    .from("profiles")
    .update({ banned })
    .eq("id", userId);
  if (error) return { error: "generic" };

  // Бонус: блокировка на уровне auth (нельзя войти), если есть service-role.
  try {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(userId, {
      ban_duration: banned ? "876000h" : "none",
    });
  } catch {
    // Без SUPABASE_SERVICE_ROLE_KEY ограничиваемся флагом profiles.banned.
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, userId, isAdmin } = await requireAdmin();
  if (!userId || !isAdmin) return { error: "loginRequired" };

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: "generic" };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, userId, isAdmin } = await requireAdmin();
  if (!userId || !isAdmin) return { error: "loginRequired" };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);
  if (error) return { error: "generic" };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCategory(
  id: number,
  names: { name_uz: string; name_ru: string; name_en: string }
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, userId, isAdmin } = await requireAdmin();
  if (!userId || !isAdmin) return { error: "loginRequired" };

  const name_uz = names.name_uz.trim().slice(0, 60);
  const name_ru = names.name_ru.trim().slice(0, 60);
  const name_en = names.name_en.trim().slice(0, 60);
  if (!name_uz || !name_ru || !name_en) return { error: "validation" };

  const { error } = await supabase
    .from("categories")
    .update({ name_uz, name_ru, name_en })
    .eq("id", id);
  if (error) return { error: "generic" };

  revalidatePath("/", "layout");
  return { ok: true };
}

export interface ImportState {
  ok?: boolean;
  created?: number;
  skipped?: number;
  error?: "demoMode" | "loginRequired" | "validation" | "generic";
}

function normalizeUrl(value: unknown): string | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s.slice(0, 500);
  return `https://${s}`.slice(0, 500);
}

/**
 * Массовый импорт продуктов админом из JSON-массива.
 * Каждый элемент: { name, tagline|description, description?, website?, logo?, category? }.
 * Категория сопоставляется по slug; неизвестная → «other». Пустые/без названия — пропуск.
 */
export async function importProducts(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, userId, isAdmin } = await requireAdmin();
  if (!userId || !isAdmin) return { error: "loginRequired" };

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("data") ?? ""));
  } catch {
    return { error: "validation" };
  }
  if (!Array.isArray(items)) return { error: "validation" };

  const fallback = findCategory("other");
  let created = 0;
  let skipped = 0;

  for (const raw of items.slice(0, 500)) {
    const it = (raw ?? {}) as Record<string, unknown>;
    const name = String(it.name ?? "").trim().slice(0, 60);
    const tagline = String(it.tagline ?? it.description ?? "")
      .trim()
      .slice(0, 140);
    if (!name || !tagline) {
      skipped++;
      continue;
    }
    const description = it.description
      ? String(it.description).trim().slice(0, 5000)
      : null;
    const website_url = normalizeUrl(it.website ?? it.website_url);
    const logo_url = normalizeUrl(it.logo ?? it.logo_url);
    const category =
      findCategory(String(it.category ?? "").trim()) ?? fallback;
    if (!category) {
      skipped++;
      continue;
    }

    const base = slugify(name) || "startup";
    let inserted = false;
    for (let n = 0; n < 5 && !inserted; n++) {
      const slug = n === 0 ? base : `${base}-${n + 1}`;
      const { error } = await supabase.from("products").insert({
        slug,
        name,
        tagline,
        description,
        website_url,
        logo_url,
        category_id: category.id,
        status: "approved",
        created_by: null,
      });
      if (!error) {
        inserted = true;
        created++;
      } else if (!/duplicate|unique/i.test(error.message)) {
        break; // не конфликт slug — этот элемент пропускаем
      }
    }
    if (!inserted) skipped++;
  }

  revalidatePath("/", "layout");
  return { ok: true, created, skipped };
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

export async function updateCommentNotifications(
  enabled: boolean
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };

  const { error } = await supabase
    .from("profiles")
    .update({ comment_notifications: enabled })
    .eq("id", user.id);
  if (error) return { error: "generic" };

  revalidatePath("/settings");
  return { ok: true };
}

export async function rateProduct(
  productId: string,
  value: number
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return { error: "validation" };
  }
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };

  const { error } = await supabase.from("ratings").upsert(
    {
      product_id: productId,
      user_id: user.id,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id,user_id" }
  );
  if (error) return { error: "generic" };

  const { data: product } = await supabase
    .from("products")
    .select("rating_sum, rating_count")
    .eq("id", productId)
    .single();

  const sum = (product as { rating_sum?: number } | null)?.rating_sum ?? 0;
  const count = (product as { rating_count?: number } | null)?.rating_count ?? 0;

  revalidatePath("/", "layout");
  return {
    ok: true,
    rating: value,
    ratingAvg: count > 0 ? sum / count : 0,
    ratingCount: count,
  };
}

export async function addComment(
  productId: string,
  content: string,
  parentId?: string | null
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };
  if (await isBanned(supabase, user.id)) return { error: "banned" };

  const text = content.trim();
  if (!text || text.length > 2000) return { error: "validation" };

  const { error } = await supabase.from("comments").insert({
    product_id: productId,
    user_id: user.id,
    parent_id: parentId ?? null,
    content: text,
  });
  if (error) return { error: "generic" };

  // Уведомляем владельца продукта письмом. Никогда не роняет комментирование.
  await notifyProductOwner(supabase, productId, user.id, text).catch(() => {});

  revalidatePath("/", "layout");
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Отправляет владельцу продукта письмо о новом комментарии.
 * Полностью защищено: при отсутствии почты/сервис-ключа — тихий no-op,
 * себе не пишем, уважаем opt-out (comment_notifications = false).
 */
async function notifyProductOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  commenterId: string,
  commentText: string
): Promise<void> {
  if (!isEmailConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const { data: product } = await supabase
    .from("products")
    .select("name, slug, created_by")
    .eq("id", productId)
    .single();
  const p = product as {
    name: string;
    slug: string;
    created_by: string | null;
  } | null;
  if (!p?.created_by || p.created_by === commenterId) return;

  const { data: owner } = await supabase
    .from("profiles")
    .select("comment_notifications")
    .eq("id", p.created_by)
    .single();
  if ((owner as { comment_notifications?: boolean } | null)?.comment_notifications === false) {
    return;
  }

  const { data: commenter } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", commenterId)
    .single();
  const c = commenter as { full_name?: string | null; username?: string } | null;
  const who = escapeHtml(c?.full_name || c?.username || "Кто-то");

  const admin = createAdminClient();
  const { data: ownerUser } = await admin.auth.admin.getUserById(p.created_by);
  const email = ownerUser?.user?.email;
  if (!email) return;

  const origin = await requestOrigin();
  const url = `${origin}/products/${p.slug}`;
  const snippet = escapeHtml(
    commentText.length > 200 ? `${commentText.slice(0, 200)}…` : commentText
  );
  const productName = escapeHtml(p.name);

  await sendEmail({
    to: email,
    subject: `Новый комментарий к «${p.name}» — TechRadar.uz`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:520px">
  <p><strong>${who}</strong> оставил(а) комментарий к вашему продукту <strong>${productName}</strong>:</p>
  <blockquote style="border-left:3px solid #14b8a6;margin:12px 0;padding:8px 14px;color:#334155">${snippet}</blockquote>
  <p><a href="${url}" style="color:#0d9488;font-weight:600">Открыть продукт →</a></p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0">
  <p style="font-size:12px;color:#94a3b8">Отключить эти письма можно в настройках профиля на TechRadar.uz</p>
</div>`,
  });
}

export interface SubmitState {
  ok?: boolean;
  error?: "demoMode" | "loginRequired" | "validation" | "generic" | "banned";
}

export async function submitProduct(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };
  const { supabase, user } = await requireUser();
  if (!user) return { error: "loginRequired" };
  if (await isBanned(supabase, user.id)) return { error: "banned" };

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

export interface SignUpState {
  ok?: boolean;
  needsConfirm?: boolean;
  error?: "validation" | "exists" | "generic" | "demoMode";
}

/**
 * Регистрация по email и паролю. Не зависит от внешних провайдеров.
 * Если в проекте включено подтверждение email — возвращаем needsConfirm
 * (пользователь подтверждает по ссылке из письма), иначе сразу логиним.
 */
export async function signUp(
  _prev: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  if (!isSupabaseConfigured()) return { error: "demoMode" };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, 80);
  const digest = formData.get("digest") === "on";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return { error: "validation" };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) =>
        list.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
    },
  });

  const site = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${site}/api/auth/confirm`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
  if (error) {
    if (/registered|already|exists/i.test(error.message)) {
      return { error: "exists" };
    }
    return { error: "generic" };
  }
  // Supabase прячет факт существования email: возвращает user без identities.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return { error: "exists" };
  }

  if (data.session) {
    if (digest && data.user) {
      await supabase
        .from("profiles")
        .update({ digest_opt_in: true })
        .eq("id", data.user.id);
    }
    revalidatePath("/", "layout");
    return { ok: true };
  }
  return { ok: true, needsConfirm: true };
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
