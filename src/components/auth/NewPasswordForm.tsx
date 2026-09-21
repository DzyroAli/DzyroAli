"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { updatePassword, type PasswordResetState } from "@/lib/actions";

/** Форма установки нового пароля (после ссылки из письма). */
export function NewPasswordForm() {
  const t = useTranslations("login");
  const [state, action, pending] = useActionState<PasswordResetState, FormData>(
    updatePassword,
    {}
  );

  if (state.ok) {
    return (
      <div className="space-y-3 text-center">
        <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-ink">
          {t("passwordUpdated")}
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand"
        >
          {t("goHome")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input
        type="password"
        name="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder={t("newPasswordPlaceholder")}
        className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {t("savePassword")}
      </button>
      {state.error && (
        <p className="text-xs text-critical">
          {state.error === "validation"
            ? t("passwordTooShort")
            : t("genericError")}
        </p>
      )}
    </form>
  );
}
