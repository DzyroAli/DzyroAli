"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { importProducts, type ImportState } from "@/lib/actions";

const EXAMPLE = `[
  {
    "name": "Startup nomi",
    "tagline": "Qisqa tavsif",
    "description": "To'liq tavsif (ixtiyoriy)",
    "website": "https://example.com",
    "logo": "https://example.com/logo.png",
    "category": "startups"
  }
]`;

export function ImportForm() {
  const t = useTranslations("admin");
  const [state, action, pending] = useActionState<ImportState, FormData>(
    importProducts,
    {}
  );

  return (
    <form action={action} className="space-y-3">
      <textarea
        name="data"
        rows={14}
        required
        placeholder={EXAMPLE}
        className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs outline-none focus:border-teal-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? t("importing") : t("importButton")}
      </button>

      {state.ok && (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
          {t("importResult", {
            created: state.created ?? 0,
            skipped: state.skipped ?? 0,
          })}
        </p>
      )}
      {state.error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error === "validation"
            ? t("importInvalid")
            : state.error === "loginRequired"
              ? t("accessDenied")
              : t("importError")}
        </p>
      )}
    </form>
  );
}
