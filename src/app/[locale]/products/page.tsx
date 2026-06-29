import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/Pagination";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { getCategories, getProducts } from "@/lib/data";

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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-slate-600">
          {total > 0 ? `${total} ${t("found")}` : t("subtitle")}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Фильтры */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-4">
            <ProductFilters
              categories={categories}
              currentCategory={category}
              currentSort={sort}
              currentSearch={q}
              onFilterChange={filterHref}
            />
          </div>
        </aside>

        {/* Результаты */}
        <main>
          {products.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-500">{t("empty")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
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
        </main>
      </div>
    </div>
  );
}
