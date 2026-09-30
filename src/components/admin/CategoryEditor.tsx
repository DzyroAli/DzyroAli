"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateCategory } from "@/lib/actions";
import type { Category } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

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
    "w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm focus:border-brand";

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-ink">
        <CategoryIcon slug={category.slug} size={15} className="text-brand" />
        <code className="text-xs text-ink-muted">{category.slug}</code>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase text-ink-muted">
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
          <span className="mb-1 block text-[11px] font-medium uppercase text-ink-muted">
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
          <span className="mb-1 block text-[11px] font-medium uppercase text-ink-muted">
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
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
            <Check size={14} /> {t("saved")}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-on-brand transition-opacity hover:opacity-90 disabled:opacity-40"
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
