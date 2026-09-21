"use client";

import { useMemo, useState } from "react";
import { LayoutList, MapIcon, Users, Package, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CITIES, cityName } from "@/lib/cities";
import { MAP_HEIGHT, MAP_WIDTH, project, UZ_OUTLINE_PATH } from "@/lib/uz-outline";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { focusRing } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";

export interface MapProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  votes: number;
  city: string | null;
}

export interface MapMaker {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  city: string | null;
}

type View = "map" | "list";

/** Marker radius grows with count but stays in a readable band. */
function radiusFor(count: number, max: number): number {
  if (count <= 0) return 0;
  const t = max <= 1 ? 1 : count / max;
  return 14 + Math.sqrt(t) * 20;
}

export function UzbekistanMap({
  products,
  makers,
  initialCity,
}: {
  products: MapProduct[];
  makers: MapMaker[];
  initialCity?: string;
}) {
  const t = useTranslations("map");
  const locale = useLocale();
  const [view, setView] = useState<View>("map");
  const [selected, setSelected] = useState<string | null>(initialCity ?? null);

  const byCity = useMemo(() => {
    const map = new Map<string, { products: MapProduct[]; makers: MapMaker[] }>();
    for (const city of CITIES) map.set(city.slug, { products: [], makers: [] });
    for (const p of products) {
      if (p.city && map.has(p.city)) map.get(p.city)!.products.push(p);
    }
    for (const m of makers) {
      if (m.city && map.has(m.city)) map.get(m.city)!.makers.push(m);
    }
    return map;
  }, [products, makers]);

  const populated = useMemo(
    () =>
      CITIES.map((city) => ({
        city,
        ...(byCity.get(city.slug) ?? { products: [], makers: [] }),
      }))
        .map((entry) => ({ ...entry, total: entry.products.length }))
        .filter((entry) => entry.total > 0 || entry.makers.length > 0)
        .sort((a, b) => b.total - a.total || b.makers.length - a.makers.length),
    [byCity]
  );

  const maxCount = populated[0]?.total ?? 0;
  const located = products.filter((p) => p.city).length;
  const selectedEntry = populated.find((e) => e.city.slug === selected) ?? null;

  if (populated.length === 0) {
    return <EmptyState title={t("emptyTitle")} description={t("emptyHint")} />;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {t("summary", { products: located, cities: populated.length })}
        </p>
        <Segmented
          value={view}
          onChange={setView}
          label={t("viewLabel")}
          options={[
            {
              value: "map",
              label: (
                <>
                  <MapIcon size={14} aria-hidden /> {t("viewMap")}
                </>
              ),
            },
            {
              value: "list",
              label: (
                <>
                  <LayoutList size={14} aria-hidden /> {t("viewList")}
                </>
              ),
            },
          ]}
        />
      </div>

      {view === "map" && (
        <Card className="overflow-hidden p-3 sm:p-4">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="h-auto w-full"
            role="img"
            aria-label={t("title")}
          >
            <path
              d={UZ_OUTLINE_PATH}
              className="fill-surface-muted stroke-line-strong"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {populated.map(({ city, total, makers: cityMakers }) => {
              const { x, y } = project(city.lng, city.lat);
              const r = Math.max(radiusFor(total, maxCount), 13);
              const isSelected = selected === city.slug;
              return (
                <g key={city.slug}>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    className={cn(
                      "cursor-pointer transition-opacity",
                      isSelected ? "fill-brand" : "fill-brand/70 hover:fill-brand"
                    )}
                    onClick={() =>
                      setSelected(isSelected ? null : city.slug)
                    }
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none fill-on-brand text-[19px] font-semibold"
                  >
                    {total || cityMakers.length}
                  </text>
                  <text
                    x={x}
                    y={y + r + 17}
                    textAnchor="middle"
                    className={cn(
                      "pointer-events-none select-none text-[17px]",
                      isSelected ? "fill-ink font-semibold" : "fill-ink-muted"
                    )}
                  >
                    {cityName(city, locale)}
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>
      )}

      {/* The map is decorative for anyone who can't use it; this list carries
          the same data and is always reachable. */}
      {view === "list" && (
        <ul className="space-y-2.5">
          {populated.map(({ city, total, makers: cityMakers }) => (
            <li key={city.slug}>
              <button
                type="button"
                onClick={() =>
                  setSelected(selected === city.slug ? null : city.slug)
                }
                aria-expanded={selected === city.slug}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-card border bg-surface p-4 text-left transition-colors",
                  focusRing,
                  selected === city.slug
                    ? "border-brand"
                    : "border-line hover:border-line-strong"
                )}
              >
                <span className="text-sm font-medium text-ink">
                  {cityName(city, locale)}
                </span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-ink-muted">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Package size={13} aria-hidden />
                    {total}
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Users size={13} aria-hidden />
                    {cityMakers.length}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedEntry && (
        <Card className="anim-fade-in mt-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">
                {cityName(selectedEntry.city, locale)}
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                {t("cityCounts", {
                  products: selectedEntry.total,
                  makers: selectedEntry.makers.length,
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label={t("close")}
              className={cn(
                "shrink-0 rounded-lg p-1 text-ink-muted hover:bg-surface-muted hover:text-ink",
                focusRing
              )}
            >
              <X size={16} aria-hidden />
            </button>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <section>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
                {t("entityProducts")}
              </h3>
              {selectedEntry.products.length === 0 ? (
                <p className="text-sm text-ink-muted">{t("noneHere")}</p>
              ) : (
                <ul className="space-y-1">
                  {selectedEntry.products.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug}`}
                        className={cn(
                          "flex items-baseline justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted",
                          focusRing
                        )}
                      >
                        <span className="min-w-0 truncate text-sm text-ink">
                          {p.name}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                          {p.votes}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
                {t("entityPeople")}
              </h3>
              {selectedEntry.makers.length === 0 ? (
                <p className="text-sm text-ink-muted">{t("noneHere")}</p>
              ) : (
                <ul className="space-y-1">
                  {selectedEntry.makers.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/makers/${m.username}`}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted",
                          focusRing
                        )}
                      >
                        <Avatar
                          name={m.name}
                          username={m.username}
                          src={m.avatarUrl}
                          size={26}
                        />
                        <span className="min-w-0 truncate text-sm text-ink">
                          {m.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </Card>
      )}
    </div>
  );
}
