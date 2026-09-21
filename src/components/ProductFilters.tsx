"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { categoryName, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { focusRing } from "./ui/Button";
import { CategoryIcon } from "./ui/CategoryIcon";

const pill =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors";

function FilterGroups({
  categories,
  currentCategory,
  currentSort,
  currentSearch,
  hrefFor,
}: {
  categories: Category[];
  currentCategory?: string;
  currentSort: "top" | "newest";
  currentSearch?: string;
  hrefFor: (next: Record<string, string | undefined>) => string;
}) {
  const t = useTranslations("products");
  const locale = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-ink-muted">
          {t("sort")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "top", label: t("sortTop") },
              { key: "newest", label: t("sortNewest") },
            ] as const
          ).map((s) => (
            <Link
              key={s.key}
              href={hrefFor({ sort: s.key === "top" ? undefined : s.key })}
              aria-current={currentSort === s.key ? "true" : undefined}
              className={cn(
                pill,
                focusRing,
                currentSort === s.key
                  ? "border-transparent bg-brand-soft text-brand-ink"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-ink-muted">
          {t("categories")}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ category: undefined })}
            aria-current={!currentCategory ? "true" : undefined}
            className={cn(
              pill,
              focusRing,
              !currentCategory
                ? "border-transparent bg-brand-soft text-brand-ink"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
            )}
          >
            {t("allCategories")}
          </Link>
          {categories.map((c) => {
            const active = currentCategory === c.slug;
            return (
              <Link
                key={c.slug}
                href={hrefFor({ category: c.slug })}
                aria-current={active ? "true" : undefined}
                className={cn(
                  pill,
                  focusRing,
                  active
                    ? "border-transparent bg-brand-soft text-brand-ink"
                    : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
                )}
              >
                <CategoryIcon slug={c.slug} size={13} className="shrink-0" />
                {categoryName(c, locale)}
              </Link>
            );
          })}
        </div>
      </div>

      {currentSearch && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-brand-soft px-3 py-2.5">
          <span className="min-w-0 truncate text-sm text-brand-ink">
            {t("searchResults")}: <strong>«{currentSearch}»</strong>
          </span>
          <Link
            href={hrefFor({ q: undefined })}
            aria-label={t("clear")}
            className={cn(
              "shrink-0 rounded text-brand-ink hover:opacity-80",
              focusRing
            )}
          >
            <X size={16} aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Catalog filters. URLs are built here from the live search params rather than
 * taking a builder function as a prop — a server component may not pass a
 * function to a client one, which is what the previous version did.
 */
export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
  currentSearch,
}: {
  categories: Category[];
  currentCategory?: string;
  currentSort: "top" | "newest";
  currentSearch?: string;
}) {
  const t = useTranslations("products");
  const searchParams = useSearchParams();

  const hrefFor = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    // Any filter change invalidates the current page offset.
    params.delete("page");
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const activeCount = (currentCategory ? 1 : 0) + (currentSort === "newest" ? 1 : 0);

  const groups = (
    <FilterGroups
      categories={categories}
      currentCategory={currentCategory}
      currentSort={currentSort}
      currentSearch={currentSearch}
      hrefFor={hrefFor}
    />
  );

  return (
    <>
      {/* Collapsed by default on small screens, where there is no sidebar. */}
      <details className="rounded-card border border-line bg-surface lg:hidden">
        <summary
          className={cn(
            "flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-ink",
            focusRing
          )}
        >
          <SlidersHorizontal size={16} className="text-brand" aria-hidden />
          {t("filters")}
          {activeCount > 0 && (
            <span className="ml-auto rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-ink">
              {activeCount}
            </span>
          )}
        </summary>
        <div className="border-t border-line p-4">{groups}</div>
      </details>

      <div className="hidden lg:block">{groups}</div>
    </>
  );
}
