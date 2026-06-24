import {
  Mail,
  MessageSquare,
  Package,
  ThumbsUp,
  Trophy,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductLogo } from "@/components/ProductLogo";
import { getProducts, getStats } from "@/lib/data";

/** Аналитика платформы: суммарные метрики и топ продуктов. */
export default async function AdminAnalyticsPage() {
  const t = await getTranslations("admin");
  const [stats, { products: top }] = await Promise.all([
    getStats(),
    getProducts({ sort: "top", perPage: 10 }),
  ]);

  const cards = [
    { label: t("totalProducts"), value: stats.totalProducts, icon: Package },
    { label: t("totalUsers"), value: stats.totalUsers, icon: Users },
    { label: t("totalVotes"), value: stats.totalVotes, icon: ThumbsUp },
    { label: t("totalComments"), value: stats.totalComments, icon: MessageSquare },
    { label: t("subscribers"), value: stats.subscribers, icon: Mail },
    { label: t("pendingProducts"), value: stats.pendingProducts, icon: Package },
  ];

  const maxVotes = Math.max(1, ...top.map((p) => p.votes_count));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{t("navAnalytics")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("analyticsSubtitle")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <c.icon size={18} className="text-teal-600" />
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {c.value}
            </p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 mt-10 flex items-center gap-2">
        <Trophy size={18} className="text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">{t("topProducts")}</h2>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        {top.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            {t("emptyQueue")}
          </p>
        )}
        {top.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <span className="w-5 text-right text-xs font-bold text-slate-400">
              {i + 1}
            </span>
            <ProductLogo name={p.name} logoUrl={p.logo_url} size={28} />
            <Link
              href={`/products/${p.slug}`}
              className="w-40 truncate text-sm font-semibold text-slate-900 hover:text-teal-700 sm:w-56"
            >
              {p.name}
            </Link>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                style={{ width: `${(p.votes_count / maxVotes) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right text-sm font-bold text-slate-700">
              {p.votes_count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
