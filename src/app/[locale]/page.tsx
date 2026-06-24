import { ArrowRight, Sparkles } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductLogo } from "@/components/ProductLogo";
import { SubscribeForm } from "@/components/SubscribeForm";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { getCategories, getNewest, getRanking } from "@/lib/data";
import { categoryName, type RankingPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: RankingPeriod = ["day", "week", "month"].includes(
    rawPeriod ?? ""
  )
    ? (rawPeriod as RankingPeriod)
    : "day";

  const t = await getTranslations("home");
  const locale = await getLocale();
  const [ranking, newest] = await Promise.all([
    getRanking(period, 10),
    getNewest(5),
  ]);
  const categories = getCategories();

  const periods: Array<{ key: RankingPeriod; label: string }> = [
    { key: "day", label: t("day") },
    { key: "week", label: t("week") },
    { key: "month", label: t("month") },
  ];
  const headings: Record<RankingPeriod, string> = {
    day: t("topDay"),
    week: t("topWeek"),
    month: t("topMonth"),
  };

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-teal-50/80 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
          >
            <Sparkles size={13} />
            {t("launchedBadge")} →
          </Link>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/submit"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition-opacity hover:opacity-90"
            >
              {t("heroSubmit")}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t("heroBrowse")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_300px]">
        {/* Ranking */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {headings[period]}
            </h2>
            <nav className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold">
              {periods.map((p) => (
                <Link
                  key={p.key}
                  href={p.key === "day" ? "/" : `/?period=${p.key}`}
                  className={cn(
                    "rounded-lg px-4 py-1.5 transition-colors",
                    p.key === period
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {p.label}
                </Link>
              ))}
            </nav>
          </div>

          {ranking.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              {t("empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {ranking.map((product, i) => (
                <ProductCard key={product.id} product={product} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-8">
          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
              {t("newest")}
            </h3>
            <ul className="space-y-3">
              {newest.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white"
                  >
                    <ProductLogo name={p.name} logoUrl={p.logo_url} size={40} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-teal-700">
                        {p.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {p.tagline}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
              {(await getTranslations("common"))("categories")}
            </h3>
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white hover:text-teal-700"
                  >
                    <span aria-hidden>{CATEGORY_EMOJI[c.slug]}</span>
                    {categoryName(c, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-5">
            <h3 className="font-bold text-slate-900">{t("subscribeTitle")}</h3>
            <p className="mb-4 mt-1 text-sm text-slate-600">
              {t("subscribeText")}
            </p>
            <SubscribeForm compact />
          </section>
        </aside>
      </div>
    </div>
  );
}
