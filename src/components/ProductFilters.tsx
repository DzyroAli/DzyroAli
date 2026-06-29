"use client";

import { ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { categoryName, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
  currentSearch,
  onFilterChange,
}: {
  categories: Category[];
  currentCategory?: string;
  currentSort: "top" | "newest";
  currentSearch?: string;
  onFilterChange: (filters: Record<string, string | undefined>) => string;
}) {
  const t = useTranslations("products");
  const locale = useLocale();

  return (
    <div className="space-y-4">
      {/* Сортировка */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          {t("sort")}
        </h3>
        <div className="flex gap-2">
          {(
            [
              { key: "top", label: t("sortTop") },
              { key: "newest", label: t("sortNewest") },
            ] as const
          ).map((s) => (
            <Link
              key={s.key}
              href={onFilterChange({ sort: s.key === "top" ? undefined : s.key })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                currentSort === s.key
                  ? "bg-teal-100 text-teal-800"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Категории */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          {t("categories")}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={onFilterChange({ category: undefined })}
            className={cn(
              "rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition-colors",
              !currentCategory
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            {t("allCategories")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={onFilterChange({ category: c.slug })}
              className={cn(
                "rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition-colors",
                currentCategory === c.slug
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <span aria-hidden className="mr-1">
                {CATEGORY_EMOJI[c.slug]}
              </span>
              {categoryName(c, locale)}
            </Link>
          ))}
        </div>
      </div>

      {/* Информация о поиске */}
      {currentSearch && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
          <span className="text-sm text-blue-900">
            🔍 {t("searchResults")}: <strong>«{currentSearch}»</strong>
          </span>
          <Link
            href={onFilterChange({ q: undefined })}
            className="text-blue-600 hover:text-blue-700"
            aria-label={t("clear")}
          >
            <X size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
