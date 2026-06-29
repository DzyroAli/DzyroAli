"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { submitProduct, type SubmitState } from "@/lib/actions";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/categories";
import { categoryName } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-teal-500";

export function SubmitForm() {
  const t = useTranslations("submit");
  const tErr = useTranslations("errors");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitProduct,
    {}
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-teal-600" size={40} />
        <p className="font-medium text-teal-800">{t("success")}</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {tc("goHome")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {t("name")} *
        </label>
        <input
          name="name"
          required
          maxLength={60}
          placeholder={t("namePlaceholder")}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {t("tagline")} *
        </label>
        <input
          name="tagline"
          required
          maxLength={140}
          placeholder={t("taglinePlaceholder")}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {t("category")} *
        </label>
        <select name="category" required className={inputClass} defaultValue="">
          <option value="" disabled />
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {CATEGORY_EMOJI[c.slug]} {categoryName(c, locale)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {t("description")}
        </label>
        <textarea
          name="description"
          rows={6}
          maxLength={5000}
          placeholder={t("descriptionPlaceholder")}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            {t("website")}
          </label>
          <input
            name="website"
            type="url"
            placeholder="https://"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            {t("telegram")}
          </label>
          <input
            name="telegram"
            type="url"
            placeholder="https://t.me/"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {t("logo")}
        </label>
        <input
          name="logo"
          type="url"
          placeholder="https://"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-400">{t("logoHint")}</p>
      </div>

      {state.error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error === "demoMode"
            ? tErr("demoMode")
            : state.error === "loginRequired"
              ? tErr("loginRequired")
              : state.error === "banned"
                ? tErr("banned")
                : tErr("generic")}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
        <p className="text-xs text-slate-400">{t("moderationNote")}</p>
      </div>
    </form>
  );
}
