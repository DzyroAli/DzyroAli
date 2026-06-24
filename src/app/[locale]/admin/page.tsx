import {
  Inbox,
  Mail,
  PartyPopper,
  Rocket,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ModerationButtons } from "@/components/ModerationButtons";
import { ProductLogo } from "@/components/ProductLogo";
import {
  getLaunchDayStats,
  getPendingProducts,
  getStats,
} from "@/lib/data";
import { categoryName } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Обзор: мониторинг дня запуска + очередь модерации в один клик. */
export default async function AdminOverviewPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const [launch, stats, pending] = await Promise.all([
    getLaunchDayStats(),
    getStats(),
    getPendingProducts(),
  ]);

  const launchCards = [
    {
      label: t("approvedToday"),
      value: launch.productsToday,
      icon: Rocket,
      tone: "text-teal-600 bg-teal-50",
    },
    {
      label: t("signupsToday"),
      value: launch.signupsToday,
      icon: UserPlus,
      tone: "text-cyan-600 bg-cyan-50",
    },
    {
      label: t("votesToday"),
      value: launch.votesToday,
      icon: ThumbsUp,
      tone: "text-violet-600 bg-violet-50",
    },
    {
      label: t("totalVotes"),
      value: stats.totalVotes,
      icon: ThumbsUp,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: t("pendingProducts"),
      value: stats.pendingProducts,
      icon: Inbox,
      tone: "text-rose-600 bg-rose-50",
    },
    {
      label: t("subscribers"),
      value: stats.subscribers,
      icon: Mail,
      tone: "text-slate-600 bg-slate-100",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2">
        <PartyPopper size={22} className="text-teal-600" />
        <h1 className="text-2xl font-bold text-slate-900">
          {t("launchDayTitle")}
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">{t("launchDaySubtitle")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {launchCards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${c.tone}`}
            >
              <c.icon size={16} />
            </span>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {c.value}
            </p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          {t("moderationQueue")}
        </h2>
        <Link
          href="/admin/moderation"
          className="text-sm font-semibold text-teal-700 hover:underline"
        >
          {t("openModeration")} →
        </Link>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          {t("emptyQueue")}
        </p>
      ) : (
        <div className="space-y-3">
          {pending.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <ProductLogo name={p.name} logoUrl={p.logo_url} size={48} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${p.slug}`}
                  className="font-semibold text-slate-900 hover:text-teal-700"
                >
                  {p.name}
                </Link>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {p.tagline}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {p.category ? categoryName(p.category, locale) : "—"}
                  {p.maker ? ` · @${p.maker.username}` : ""} ·{" "}
                  {formatDate(p.created_at, locale)}
                </p>
              </div>
              <ModerationButtons productId={p.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
