import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORY_EMOJI, findCategory } from "@/lib/categories";
import { getProducts } from "@/lib/data";
import { categoryName } from "@/lib/types";

const PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: categoryName(category, locale),
    description: t("productsDescription"),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const category = findCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(rawPage) || 1);
  const locale = await getLocale();
  const t = await getTranslations("products");
  const { products, total } = await getProducts({
    categorySlug: slug,
    page,
    perPage: PER_PAGE,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
        <span aria-hidden className="text-3xl">
          {CATEGORY_EMOJI[slug]}
        </span>
        {categoryName(category, locale)}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {total} {t("found")}
      </p>

      {products.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} rank={(page - 1) * PER_PAGE + i + 1} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={Math.ceil(total / PER_PAGE)}
        basePath={`/category/${slug}`}
        params={{}}
      />
    </div>
  );
}
