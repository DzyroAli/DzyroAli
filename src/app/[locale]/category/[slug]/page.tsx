import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { PageBody } from "@/components/shell/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategories, getProducts, getVotedProductIds } from "@/lib/data";
import { categoryName } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

const PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
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
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) notFound();

  const page = Math.max(1, Number(rawPage) || 1);
  const locale = await getLocale();
  const t = await getTranslations("products");
  const { products, total } = await getProducts({
    categorySlug: slug,
    page,
    perPage: PER_PAGE,
  });
  const voted = await getVotedProductIds(products.map((p) => p.id));

  return (
    <PageBody>
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"
        >
          <CategoryIcon slug={slug} size={20} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]">
            {categoryName(category, locale)}
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            {total} {t("found")}
          </p>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t("empty")} description={t("emptyHint")} />
        </div>
      ) : (
        <div className="mt-6 space-y-2.5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} voted={voted.has(p.id)} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={Math.ceil(total / PER_PAGE)}
          basePath={`/category/${slug}`}
          params={{}}
        />
      </div>
    </PageBody>
  );
}
