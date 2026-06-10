"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { subscribe, type SubscribeState } from "@/lib/actions";

export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("footer");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<SubscribeState, FormData>(
    subscribe,
    {}
  );

  if (state.ok) {
    return (
      <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
        {t("subscribeSuccess")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <div className={compact ? "flex flex-col gap-2" : "flex gap-2"}>
        <input
          type="email"
          name="email"
          required
          placeholder={t("subscribePlaceholder")}
          className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {t("subscribeButton")}
        </button>
      </div>
      {state.error && (
        <p className="text-xs text-rose-600">
          {state.error === "demoMode" ? tErr("demoMode") : t("subscribeError")}
        </p>
      )}
    </form>
  );
}
