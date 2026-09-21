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
        className="w-full rounded-card border border-line bg-surface p-4 font-mono text-xs outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? t("importing") : t("importButton")}
      </button>

      {state.ok && (
        <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-ink">
          {t("importResult", {
            created: state.created ?? 0,
            skipped: state.skipped ?? 0,
          })}
        </p>
      )}
      {state.error && (
        <p className="rounded-xl bg-critical-soft px-4 py-3 text-sm text-critical">
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
