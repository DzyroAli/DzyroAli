import { getLocale, getTranslations } from "next-intl/server";
import { Avatar } from "@/components/ui/Avatar";
import { focusRing } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { categoryIcon } from "@/lib/categories";
import { cityName, findCity } from "@/lib/cities";
import type { EcosystemStats, MakerRank } from "@/lib/data";
import { categoryName, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

function RailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
        {title}
      </h2>
      {children}
    </Card>
  );
}

/** Single-colour bar — proportion at a glance, no chart junk. */
function Meter({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <span
      aria-hidden
      className="block h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-surface-muted"
    >
      <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
    </span>
  );
}

/**
 * Supporting rail. Everything here is derived from real rows — category and
 * city distribution, and the makers leaderboard. No invented metrics.
 */
export async function SideRail({
  stats,
  categories,
  makers,
}: {
  stats: EcosystemStats;
  categories: Category[];
  makers: MakerRank[];
}) {
  const locale = await getLocale();
  const t = await getTranslations("rail");

  const byId = new Map(categories.map((c) => [c.slug, c]));
  const topCategories = stats.categories.slice(0, 5);
  const maxCategory = topCategories[0]?.count ?? 0;
  const topCities = stats.cities.slice(0, 5);
  const topMakers = makers.slice(0, 5);

  return (
    <>
      {topCategories.length > 0 && (
        <RailCard title={t("categories")}>
          <ul className="space-y-3">
            {topCategories.map((entry) => {
              const category = byId.get(entry.slug);
              if (!category) return null;
              const Icon = categoryIcon(entry.slug);
              return (
                <li key={entry.slug}>
                  <Link
                    href={`/category/${entry.slug}`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg text-sm",
                      focusRing
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2 text-ink">
                      <Icon size={14} className="shrink-0 text-brand" aria-hidden />
                      <span className="truncate">{categoryName(category, locale)}</span>
                    </span>
                    <Meter value={entry.count} max={maxCategory} />
                    <span className="w-5 shrink-0 text-right tabular-nums text-ink-muted">
                      {entry.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </RailCard>
      )}

      {topCities.length > 0 && (
        <RailCard title={t("cities")}>
          <ul className="space-y-1">
            {topCities.map((entry) => {
              const city = findCity(entry.slug);
              if (!city) return null;
              return (
                <li key={entry.slug}>
                  <Link
                    href={`/map?city=${entry.slug}`}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-ink transition-colors hover:bg-surface-muted",
                      focusRing
                    )}
                  >
                    <span className="truncate">{cityName(city, locale)}</span>
                    <span className="shrink-0 tabular-nums text-ink-muted">
                      {entry.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </RailCard>
      )}

      {topMakers.length > 0 && (
        <RailCard title={t("makers")}>
          <ul className="space-y-1">
            {topMakers.map(({ profile, votes }) => (
              <li key={profile.id}>
                <Link
                  href={`/makers/${profile.username}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted",
                    focusRing
                  )}
                >
                  <Avatar
                    name={profile.full_name ?? profile.username}
                    username={profile.username}
                    src={profile.avatar_url}
                    size={28}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {profile.full_name ?? profile.username}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                    {votes}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </RailCard>
      )}
    </>
  );
}
