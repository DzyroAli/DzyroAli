import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { PageBody } from "@/components/shell/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategories, getProducts, getVotedProductIds } from "@/lib/data";

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
  const categories = await getCategories();
  const { products, total } = await getProducts({
    q,
    categorySlug: category,
    sort,
    page,
    perPage: PER_PAGE,
  });
  const totalPages = Math.ceil(total / PER_PAGE);
  const voted = await getVotedProductIds(products.map((p) => p.id));

  return (
    <PageBody>
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">
          {total > 0 ? `${total} ${t("found")}` : t("subtitle")}
        </p>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[264px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-[89px] lg:self-start lg:rounded-card lg:border lg:border-line lg:bg-surface lg:p-4">
          <ProductFilters
            categories={categories}
            currentCategory={category}
            currentSort={sort}
            currentSearch={q}
          />
        </div>

        <div className="min-w-0">
          {products.length === 0 ? (
            <EmptyState title={t("empty")} description={t("emptyHint")} />
          ) : (
            <>
              <div className="space-y-2.5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} voted={voted.has(p.id)} />
                ))}
              </div>

              <div className="mt-8">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/products"
                  params={{ q, category, sort: rawSort }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </PageBody>
  );
}
