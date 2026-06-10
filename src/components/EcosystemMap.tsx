"use client";

import { Home, LayoutList, Map as MapIcon, Package, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/categories";
import { categoryName } from "@/lib/types";
import { cn, gradientFor, initials } from "@/lib/utils";

export interface MapProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  votes: number;
  categorySlug: string;
}

export interface MapMaker {
  id: string;
  username: string;
  name: string;
  role: string;
}

type Entity = "products" | "people";
type View = "map" | "list";

const PER_PAGE = 12;

const CATEGORY_COLOR: Record<string, string> = {
  startups: "bg-teal-500",
  "ai-assistants": "bg-violet-500",
  "telegram-bots": "bg-sky-500",
  "for-websites": "bg-cyan-500",
  "for-telegram": "bg-blue-500",
  "seeking-investment": "bg-amber-500",
  "seeking-team": "bg-rose-500",
  "seeking-partners": "bg-orange-500",
  other: "bg-slate-400",
};

/** Детерминированный hash → стабильная позиция точки между рендерами. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function dotPosition(id: string, ring: number, rings: number) {
  const angle = (hash(id) % 360) * (Math.PI / 180);
  // Кольцо радара по категории + лёгкий разброс внутри кольца
  const radius = 12 + ((ring + 0.3 + (hash(id + "r") % 60) / 100) / rings) * 36;
  return {
    left: `${50 + radius * Math.cos(angle)}%`,
    top: `${50 + radius * Math.sin(angle)}%`,
  };
}

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; icon: React.ReactNode }>;
}) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all",
            value === o.value
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Радар экосистемы: продукты/люди на круговой «карте» (кольца — категории)
 * с тултипами, либо постраничный список.
 */
export function EcosystemMap({
  products,
  makers,
}: {
  products: MapProduct[];
  makers: MapMaker[];
}) {
  const t = useTranslations("map");
  const locale = useLocale();
  const [entity, setEntity] = useState<Entity>("products");
  const [view, setView] = useState<View>("map");
  const [page, setPage] = useState(1);

  const ringIndex = useMemo(() => {
    const map = new Map<string, number>();
    CATEGORIES.forEach((c, i) => map.set(c.slug, i % 4));
    return map;
  }, []);

  const items = entity === "products" ? products : makers;
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const pageItems = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function switchEntity(e: Entity) {
    setEntity(e);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            aria-label={t("backHome")}
          >
            <Home size={15} />
            <span className="hidden sm:inline">{t("backHome")}</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {t("title")}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <ToggleGroup<Entity>
            value={entity}
            onChange={switchEntity}
            options={[
              {
                value: "products",
                label: t("entityProducts"),
                icon: <Package size={14} />,
              },
              {
                value: "people",
                label: t("entityPeople"),
                icon: <Users size={14} />,
              },
            ]}
          />
          <ToggleGroup<View>
            value={view}
            onChange={setView}
            options={[
              { value: "map", label: t("viewMap"), icon: <MapIcon size={14} /> },
              {
                value: "list",
                label: t("viewList"),
                icon: <LayoutList size={14} />,
              },
            ]}
          />
        </div>
      </div>

      {view === "map" ? (
        <div className="anim-fade-in relative mt-6 aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 sm:aspect-[16/10]">
          {/* Кольца радара */}
          {[24, 48, 72, 96].map((size) => (
            <div
              key={size}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-400/15"
              style={{ width: `${size}%`, aspectRatio: "1" }}
            />
          ))}
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400 shadow-[0_0_24px_4px_rgba(45,212,191,0.5)]" />

          {entity === "products"
            ? products.map((p) => {
                const pos = dotPosition(
                  p.id,
                  ringIndex.get(p.categorySlug) ?? 3,
                  4
                );
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    style={pos}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <span
                      className={cn(
                        "block rounded-full ring-2 ring-white/20 transition-transform group-hover:scale-150",
                        CATEGORY_COLOR[p.categorySlug] ?? "bg-slate-400",
                        p.votes > 5 ? "h-4 w-4" : "h-3 w-3"
                      )}
                    />
                    {/* Тултип */}
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-44 -translate-x-1/2 rounded-xl bg-white p-2.5 text-center shadow-xl group-hover:block">
                      <span className="block truncate text-xs font-bold text-slate-900">
                        {p.name}
                      </span>
                      <span className="line-clamp-2 block text-[11px] text-slate-500">
                        {p.tagline}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-bold text-teal-600">
                        ▲ {p.votes}
                      </span>
                    </span>
                  </Link>
                );
              })
            : makers.map((m) => {
                const pos = dotPosition(m.id, hash(m.id) % 4, 4);
                return (
                  <Link
                    key={m.id}
                    href={`/makers/${m.username}`}
                    style={pos}
                    className="group absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white ring-2 ring-white/20 transition-transform group-hover:scale-125",
                        gradientFor(m.username)
                      )}
                    >
                      {initials(m.name)}
                    </span>
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-36 -translate-x-1/2 rounded-xl bg-white p-2.5 text-center shadow-xl group-hover:block">
                      <span className="block truncate text-xs font-bold text-slate-900">
                        {m.name}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        @{m.username}
                      </span>
                    </span>
                  </Link>
                );
              })}

          {/* Легенда категорий */}
          {entity === "products" && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-x-3 gap-y-1">
              {CATEGORIES.slice(0, 5).map((c) => (
                <span
                  key={c.slug}
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate-300"
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      CATEGORY_COLOR[c.slug]
                    )}
                  />
                  {categoryName(c, locale)}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="anim-fade-in mt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entity === "products"
              ? (pageItems as MapProduct[]).map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <span className="flex items-center justify-between">
                      <span className="truncate font-semibold text-slate-900">
                        {CATEGORY_EMOJI[p.categorySlug] ?? "✨"} {p.name}
                      </span>
                      <span className="shrink-0 text-sm font-bold text-teal-600">
                        ▲ {p.votes}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm text-slate-500">
                      {p.tagline}
                    </span>
                  </Link>
                ))
              : (pageItems as MapMaker[]).map((m) => (
                  <Link
                    key={m.id}
                    href={`/makers/${m.username}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                        gradientFor(m.username)
                      )}
                    >
                      {initials(m.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-900">
                        {m.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        @{m.username}
                      </span>
                    </span>
                  </Link>
                ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-9 w-9 rounded-xl text-sm font-semibold transition-colors",
                    p === page
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
