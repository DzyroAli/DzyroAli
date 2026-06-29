"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  requestPasswordReset,
  signInWithPassword,
  signUp,
  type PasswordLoginState,
  type PasswordResetState,
  type SignUpState,
} from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { TelegramLogin } from "../TelegramLogin";
import { MagicLinkForm } from "../MagicLinkForm";

/** Кука, по которой auth-колбэки включают подписку на дайджест. */
const DIGEST_COOKIE = "tr_digest";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.13-1.56.37-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.6 4.6 1.8l3.43-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

/**
 * Панель входа: используется и в модалке, и на странице /login.
 * Кнопки активируются только после двух обязательных согласий.
 */
export function AuthPanel({
  telegramBot,
  onSuccess,
}: {
  telegramBot?: string;
  onSuccess?: () => void;
}) {
  const t = useTranslations("login");
  const locale = useLocale();
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [digest, setDigest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [oauthError, setOauthError] = useState(false);

  const consented = agreePrivacy && agreeTerms;

  const [loginState, loginAction, loginPending] = useActionState<
    PasswordLoginState,
    FormData
  >(signInWithPassword, {});
  const [signUpState, signUpAction, signUpPending] = useActionState<
    SignUpState,
    FormData
  >(signUp, {});
  const [resetState, resetAction, resetPending] = useActionState<
    PasswordResetState,
    FormData
  >(requestPasswordReset, {});

  // Выбор дайджеста доезжает до OAuth/Telegram-колбэков через куку.
  useEffect(() => {
    if (digest) {
      document.cookie = `${DIGEST_COOKIE}=1; path=/; max-age=900; samesite=lax`;
    } else {
      document.cookie = `${DIGEST_COOKIE}=; path=/; max-age=0`;
    }
  }, [digest]);

  useEffect(() => {
    if (loginState.ok) {
      onSuccess?.();
      window.location.reload();
    }
  }, [loginState.ok, onSuccess]);

  // Регистрация с моментальной сессией (без подтверждения email) — перезагружаем.
  useEffect(() => {
    if (signUpState.ok && !signUpState.needsConfirm) {
      onSuccess?.();
      window.location.reload();
    }
  }, [signUpState.ok, signUpState.needsConfirm, onSuccess]);

  async function signInGoogle() {
    if (!consented) return;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
      },
    });
    if (error) setOauthError(true);
  }

  const checkboxCls =
    "mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-teal-600";
  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-teal-500";

  return (
    <div className="space-y-4">
      {/* Согласия — обязательные пункты помечены красной звёздочкой */}
      <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className={checkboxCls}
          />
          <span>
            <span className="font-bold text-rose-500">*</span>{" "}
            {t.rich("consentPrivacy", {
              link: (chunks) => (
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-medium text-teal-700 underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className={checkboxCls}
          />
          <span>
            <span className="font-bold text-rose-500">*</span>{" "}
            {t.rich("consentTerms", {
              link: (chunks) => (
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-medium text-teal-700 underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={digest}
            onChange={(e) => setDigest(e.target.checked)}
            className={checkboxCls}
          />
          <span>{t("consentDigest")}</span>
        </label>
        {!consented && (
          <p className="pt-0.5 text-[11px] text-slate-400">{t("consentHint")}</p>
        )}
      </div>

      {/* OAuth-провайдеры */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={signInGoogle}
          disabled={!consented}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <GoogleIcon />
          {t("googleButton")}
        </button>

        {telegramBot ? (
          <div className="relative">
            <TelegramLogin botUsername={telegramBot} />
            {!consented && (
              <div
                className="absolute inset-0 z-10 cursor-not-allowed rounded-xl bg-white/60"
                title={t("consentHint")}
              />
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled
            title={t("telegramUnavailable")}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#54a9eb] px-4 py-2.5 text-sm font-semibold text-white opacity-40"
          >
            ✈️ {t("telegramButton")}
          </button>
        )}
        {oauthError && (
          <p className="text-xs text-rose-600">{t("oauthError")}</p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t("passwordDivider")}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      {resetMode ? (
        resetState.ok ? (
          <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
            {t("resetSent")}
          </p>
        ) : (
          <form action={resetAction} className="space-y-2.5">
            <p className="text-xs text-slate-500">{t("resetHint")}</p>
            <input
              type="email"
              name="email"
              required
              placeholder={t("emailPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={resetPending}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {t("resetSubmit")}
              </button>
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t("resetBack")}
              </button>
            </div>
            {resetState.error && (
              <p className="text-xs text-rose-600">{t("genericError")}</p>
            )}
          </form>
        )
      ) : (
        <div className="space-y-3">
          {/* Вкладки: вход / регистрация */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={cn(
                "flex-1 rounded-lg py-1.5 transition-colors",
                authMode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t("loginTab")}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={cn(
                "flex-1 rounded-lg py-1.5 transition-colors",
                authMode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t("registerTab")}
            </button>
          </div>

          {authMode === "login" ? (
            <form action={loginAction} className="space-y-2.5">
              <div className="relative">
                <User
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="identifier"
                  required
                  autoComplete="username"
                  placeholder={t("identifierPlaceholder")}
                  className={inputCls}
                />
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  placeholder={t("passwordPlaceholder")}
                  className={cn(inputCls, "pr-10")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {digest && <input type="hidden" name="digest" value="on" />}
              <div className="flex items-center justify-between text-xs">
                <label className="flex cursor-pointer items-center gap-1.5 text-slate-600">
                  <input
                    type="checkbox"
                    name="remember"
                    defaultChecked
                    className="h-3.5 w-3.5 rounded accent-teal-600"
                  />
                  {t("rememberMe")}
                </label>
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="font-medium text-teal-700 hover:underline"
                >
                  {t("forgotPassword")}
                </button>
              </div>
              <button
                type="submit"
                disabled={!consented || loginPending}
                className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loginPending ? t("loggingIn") : t("loginButton")}
              </button>
              {loginState.error && (
                <p className="text-xs text-rose-600">
                  {loginState.error === "credentials"
                    ? t("credentialsError")
                    : t("genericError")}
                </p>
              )}
            </form>
          ) : signUpState.ok && signUpState.needsConfirm ? (
            <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
              {t("registerConfirm")}
            </p>
          ) : (
            <form action={signUpAction} className="space-y-2.5">
              <div className="relative">
                <User
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  className={inputCls}
                />
              </div>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              />
              <div className="relative">
                <Lock
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder={t("newPasswordPlaceholder")}
                  className={cn(inputCls, "pr-10")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">{t("passwordHint")}</p>
              {digest && <input type="hidden" name="digest" value="on" />}
              <button
                type="submit"
                disabled={!consented || signUpPending}
                className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {signUpPending ? t("registering") : t("registerButton")}
              </button>
              {signUpState.error && (
                <p className="text-xs text-rose-600">
                  {signUpState.error === "exists"
                    ? t("emailExists")
                    : signUpState.error === "validation"
                      ? t("passwordHint")
                      : t("genericError")}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t("emailDivider")}
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <MagicLinkForm />
    </div>
  );
}
