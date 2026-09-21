"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { sendMagicLink, type MagicLinkState } from "@/lib/actions";

export function MagicLinkForm() {
  const t = useTranslations("login");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<MagicLinkState, FormData>(
    sendMagicLink,
    {}
  );

  if (state.ok) {
    return (
      <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-ink">
        {t("emailSent")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder={t("emailPlaceholder")}
          className="w-full min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-brand"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-on-brand transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {t("emailSubmit")}
        </button>
      </div>
      {state.error && (
        <p className="text-xs text-critical">
          {state.error === "demoMode" ? tErr("demoMode") : tErr("generic")}
        </p>
      )}
    </form>
  );
}
