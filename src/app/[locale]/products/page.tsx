import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { getCategories, getProducts } from "@/lib/data";
import { categoryName } from "@/lib/types";
import { cn } from "@/lib/utils";

const PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("productsTitle"),
    description: t("productsDescription"),
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { q, category, sort: rawSort, page: rawPage } = await searchParams;
  const sort = rawSort === "newest" ? "newest" : "top";
  const page = Math.max(1, Number(rawPage) || 1);

  const t = await getTranslations("products");
  const locale = await getLocale();
  const categories = getCategories();
  const { products, total } = await getProducts({
    q,
    categorySlug: category,
    sort,
    page,
    perPage: PER_PAGE,
  });
  const totalPages = Math.ceil(total / PER_PAGE);

  const filterHref = (next: Record<string, string | undefined>) => {
    const merged = { q, category, sort: rawSort, ...next };
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) search.set(k, v);
    }
    const qs = search.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">
        {q ? `${t("searchResults")}: «${q}»` : t("title")}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {q ? `${total} ${t("found")}` : t("subtitle")}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={filterHref({ category: undefined })}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            !category
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
          )}
        >
          {t("allCategories")}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={filterHref({ category: c.slug })}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c.slug
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
            )}
          >
            <span aria-hidden className="mr-1">
              {CATEGORY_EMOJI[c.slug]}
            </span>
            {categoryName(c, locale)}
          </Link>
        ))}
      </div>

      <div className="mt-5 flex gap-2 text-sm font-semibold">
        {(
          [
            { key: "top", label: t("sortTop") },
            { key: "newest", label: t("sortNewest") },
          ] as const
        ).map((s) => (
          <Link
            key={s.key}
            href={filterHref({ sort: s.key === "top" ? undefined : s.key })}
            className={cn(
              "rounded-lg px-3 py-1.5 transition-colors",
              sort === s.key
                ? "bg-teal-100 text-teal-800"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/products"
        params={{ q, category, sort: rawSort }}
      />
    </div>
  );
}
