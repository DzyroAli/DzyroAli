"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendMagicLink, type MagicLinkState } from "@/lib/actions";

export function MagicLinkForm() {
  const t = useTranslations("login");
  const tErr = useTranslations("errors");
  const [state, formAction, pending] = useActionState<MagicLinkState, FormData>(
    sendMagicLink,
    {}
  );

  if (state.ok) {
    return (
      <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
        {t("emailSent")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder={t("emailPlaceholder")}
          className="w-full min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {t("emailSubmit")}
        </button>
      </div>
      {state.error && (
        <p className="text-xs text-rose-600">
          {state.error === "demoMode" ? tErr("demoMode") : tErr("generic")}
        </p>
      )}
    </form>
  );
}
