"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateCategory } from "@/lib/actions";
import { CATEGORY_EMOJI } from "@/lib/categories";
import type { Category } from "@/lib/types";

function CategoryRow({ category }: { category: Category }) {
  const t = useTranslations("admin");
  const [uz, setUz] = useState(category.name_uz);
  const [ru, setRu] = useState(category.name_ru);
  const [en, setEn] = useState(category.name_en);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty =
    uz !== category.name_uz ||
    ru !== category.name_ru ||
    en !== category.name_en;

  const save = () =>
    startTransition(async () => {
      const res = await updateCategory(category.id, {
        name_uz: uz,
        name_ru: ru,
        name_en: en,
      });
      if (!res.error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-teal-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span aria-hidden>{CATEGORY_EMOJI[category.slug] ?? "✨"}</span>
        <code className="text-xs text-slate-400">{category.slug}</code>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase text-slate-400">
            UZ
          </span>
          <input
            value={uz}
            maxLength={60}
            onChange={(e) => setUz(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase text-slate-400">
            RU
          </span>
          <input
            value={ru}
            maxLength={60}
            onChange={(e) => setRu(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase text-slate-400">
            EN
          </span>
          <input
            value={en}
            maxLength={60}
            onChange={(e) => setEn(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>
      <div className="mt-3 flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600">
            <Check size={14} /> {t("saved")}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
}

export function CategoryEditor({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-3">
      {categories.map((c) => (
        <CategoryRow key={c.id} category={c} />
      ))}
    </div>
  );
}
