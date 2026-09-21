import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreatorCard } from "@/components/CreatorCard";
import { PageBody } from "@/components/shell/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLeaderboard } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "community" });
  return { title: t("title"), description: t("subtitle") };
}

/**
 * Community index — the makers behind the products, ranked the same way as the
 * leaderboard but presented as profiles rather than a ranking table.
 */
export default async function MakersPage() {
  const t = await getTranslations("community");
  const makers = await getLeaderboard(60);

  return (
    <PageBody>
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">
          {t("subtitle")}
        </p>
      </header>

      {makers.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t("empty")} />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {makers.map(({ profile, products, votes }) => (
            <CreatorCard
              key={profile.id}
              profile={profile}
              products={products}
              votes={votes}
            />
          ))}
        </div>
      )}
    </PageBody>
  );
}
