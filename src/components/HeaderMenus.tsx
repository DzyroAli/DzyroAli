import {
  Archive,
  Award,
  BookOpen,
  ChevronDown,
  Info,
  Map,
  Trophy,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { getCategories, getRanking } from "@/lib/data";
import { categoryName } from "@/lib/types";
import { ProductLogo } from "./ProductLogo";

const summaryCls =
  "flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900";
const itemCls =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100";

/** Меню «Лучшие продукты»: категории слева, тренды недели справа. */
async function BestProductsMenu() {
  const t = await getTranslations("nav");
  const locale = await getLocale();
  const categories = getCategories();
  const trending = await getRanking("week", 4);
  const top = trending[0];

  return (
    <details className="dropdown relative hidden lg:block">
      <summary className={summaryCls}>
        {t("bestProducts")} <ChevronDown size={14} />
      </summary>
      <div className="dropdown-panel anim-fade-in absolute left-1/2 top-full mt-2 w-[560px] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="px-3 pb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              {t("byCategory")}
            </p>
            <ul className="max-h-72 overflow-y-auto">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className={itemCls}>
                    <span aria-hidden>{CATEGORY_EMOJI[c.slug] ?? "✨"}</span>
                    {categoryName(c, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="px-3 pb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              {t("trendingWeek")}
            </p>
            <ul>
              {trending.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.slug}`} className={itemCls}>
                    <ProductLogo name={p.name} logoUrl={p.logo_url} size={28} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
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
            {top && (
              <Link
                href={`/products/${top.slug}`}
                className="mt-2 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-3.5 py-2.5 text-white transition-opacity hover:opacity-90"
              >
                <Award size={18} className="shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide opacity-80">
                    {t("launchOfTheDay")}
                  </span>
                  <span className="block truncate text-sm font-bold">
                    {top.name}
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}

/** Навигационные дропдауны шапки. */
export async function HeaderMenus() {
  const t = await getTranslations("nav");

  return (
    <nav className="hidden items-center lg:flex">
      <BestProductsMenu />

      <details className="dropdown relative hidden lg:block">
        <summary className={summaryCls}>
          {t("launches")} <ChevronDown size={14} />
        </summary>
        <div className="dropdown-panel anim-fade-in absolute left-0 top-full mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <Link href="/products?sort=newest" className={itemCls}>
            <Archive size={15} className="text-slate-400" />
            {t("launchArchive")}
          </Link>
          <Link href="/launch-guide" className={itemCls}>
            <BookOpen size={15} className="text-slate-400" />
            {t("launchGuide")}
          </Link>
        </div>
      </details>

      <details className="dropdown relative hidden lg:block">
        <summary className={summaryCls}>
          {t("community")} <ChevronDown size={14} />
        </summary>
        <div className="dropdown-panel anim-fade-in absolute left-0 top-full mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <Link href="/leaderboard" className={itemCls}>
            <Trophy size={15} className="text-slate-400" />
            {t("leaderboard")}
          </Link>
          <Link href="/map" className={itemCls}>
            <Map size={15} className="text-slate-400" />
            {t("ecosystemMap")}
          </Link>
          <Link href="/about" className={itemCls}>
            <Info size={15} className="text-slate-400" />
            {t("about")}
          </Link>
        </div>
      </details>
    </nav>
  );
}
