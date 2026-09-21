import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { focusRing } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { CITIES, cityName, findCity } from "@/lib/cities";
import type { EcosystemStats } from "@/lib/data";
import { MAP_HEIGHT, MAP_WIDTH, project, UZ_OUTLINE_PATH } from "@/lib/uz-outline";
import { cn } from "@/lib/utils";

/**
 * Small supporting block on the home page — a static, non-interactive preview
 * of the map. The full interactive version lives at /map.
 */
export async function HomeMapCard({ stats }: { stats: EcosystemStats }) {
  const t = await getTranslations("map");
  const locale = await getLocale();

  const counts = new Map(stats.cities.map((c) => [c.slug, c.count]));
  const max = stats.cities[0]?.count ?? 0;
  if (max === 0) return null;

  const top = stats.cities.slice(0, 4);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4">
        <h2 className="text-[15px] font-semibold text-ink">{t("homeTitle")}</h2>
        <Link
          href="/map"
          className={cn(
            "inline-flex items-center gap-1 rounded text-[13px] font-medium text-brand-ink hover:underline",
            focusRing
          )}
        >
          {t("openMap")}
          <ArrowRight size={13} aria-hidden />
        </Link>
      </div>

      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="mt-2 h-auto w-full"
        role="img"
        aria-label={t("homeTitle")}
      >
        <path
          d={UZ_OUTLINE_PATH}
          className="fill-surface-muted stroke-line-strong"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {CITIES.map((city) => {
          const count = counts.get(city.slug) ?? 0;
          if (count === 0) return null;
          const { x, y } = project(city.lng, city.lat);
          const r = 10 + Math.sqrt(count / max) * 16;
          return <circle key={city.slug} cx={x} cy={y} r={r} className="fill-brand/75" />;
        })}
      </svg>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 pb-4 text-[13px] text-ink-muted">
        {top.map((entry) => {
          const city = findCity(entry.slug);
          if (!city) return null;
          return (
            <li key={entry.slug}>
              <Link
                href={`/map?city=${entry.slug}`}
                className={cn("rounded hover:text-ink", focusRing)}
              >
                {cityName(city, locale)}{" "}
                <span className="tabular-nums text-ink-subtle">{entry.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
