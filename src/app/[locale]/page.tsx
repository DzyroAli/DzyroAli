import { getTranslations } from "next-intl/server";
import { HomeMapCard } from "@/components/map/HomeMapCard";
import { ProductCard } from "@/components/ProductCard";
import { RadarFeaturedCard } from "@/components/RadarFeaturedCard";
import { PageWithRail } from "@/components/shell/AppShell";
import { SideRail } from "@/components/shell/SideRail";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/Card";
import { TabLinks } from "@/components/ui/Tabs";
import {
  getCategories,
  getEcosystemStats,
  getLeaderboard,
  getNewest,
  getRanking,
  getVotedProductIds,
} from "@/lib/data";
import type { RankingPeriod } from "@/lib/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: RankingPeriod = ["day", "week", "month"].includes(rawPeriod ?? "")
    ? (rawPeriod as RankingPeriod)
    : "day";

  const t = await getTranslations("home");

  const [ranking, categories, stats, makers] = await Promise.all([
    getRanking(period, 12),
    getCategories(),
    getEcosystemStats(),
    getLeaderboard(5),
  ]);

  const [featured, ...rest] = ranking;
  const voted = await getVotedProductIds(ranking.map((p) => p.id));

  const periodTabs = [
    { key: "day", label: t("day"), href: "/" },
    { key: "week", label: t("week"), href: "/?period=week" },
    { key: "month", label: t("month"), href: "/?period=month" },
  ];

  return (
    <PageWithRail
      rail={
        <>
          <SideRail stats={stats} categories={categories} makers={makers} />
          <HomeMapCard stats={stats} />
        </>
      }
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">
            {t("subtitle")}
          </p>
        </div>
        <TabLinks items={periodTabs} active={period} label={t("periodLabel")} />
      </header>

      {featured ? (
        <div className="mt-6">
          <RadarFeaturedCard product={featured} voted={voted.has(featured.id)} />
        </div>
      ) : null}

      <section className="mt-8">
        <SectionHeading
          title={t("newest")}
          meta={t("launchCount", { count: ranking.length })}
        />
        {rest.length === 0 ? (
          <EmptyState title={t("empty")} description={t("emptyHint")} />
        ) : (
          <div className="space-y-2.5">
            {rest.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                voted={voted.has(product.id)}
              />
            ))}
          </div>
        )}
      </section>
    </PageWithRail>
  );
}
