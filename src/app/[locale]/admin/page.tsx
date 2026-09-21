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
      tone: "text-brand bg-brand-soft",
    },
    {
      label: t("signupsToday"),
      value: launch.signupsToday,
      icon: UserPlus,
      tone: "text-brand bg-brand-soft",
    },
    {
      label: t("votesToday"),
      value: launch.votesToday,
      icon: ThumbsUp,
      tone: "text-brand bg-brand-soft",
    },
    {
      label: t("totalVotes"),
      value: stats.totalVotes,
      icon: ThumbsUp,
      tone: "text-brand bg-brand-soft",
    },
    {
      label: t("pendingProducts"),
      value: stats.pendingProducts,
      icon: Inbox,
      tone: "text-critical bg-critical-soft",
    },
    {
      label: t("subscribers"),
      value: stats.subscribers,
      icon: Mail,
      tone: "text-ink-muted bg-surface-muted",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2">
        <PartyPopper size={22} className="text-brand" />
        <h1 className="text-2xl font-semibold text-ink">
          {t("launchDayTitle")}
        </h1>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{t("launchDaySubtitle")}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {launchCards.map((c) => (
          <div
            key={c.label}
            className="rounded-card border border-line bg-surface p-4"
          >
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${c.tone}`}
            >
              <c.icon size={16} />
            </span>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {c.value}
            </p>
            <p className="text-xs text-ink-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">
          {t("moderationQueue")}
        </h2>
        <Link
          href="/admin/moderation"
          className="text-sm font-semibold text-brand-ink hover:underline"
        >
          {t("openModeration")} →
        </Link>
      </div>

      {pending.length === 0 ? (
        <p className="rounded-card border border-dashed border-line-strong p-8 text-center text-ink-muted">
          {t("emptyQueue")}
        </p>
      ) : (
        <div className="space-y-3">
          {pending.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-center"
            >
              <ProductLogo name={p.name} logoUrl={p.logo_url} size={48} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${p.slug}`}
                  className="font-semibold text-ink hover:text-brand-ink"
                >
                  {p.name}
                </Link>
                <p className="line-clamp-2 text-sm text-ink-muted">
                  {p.tagline}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {p.category ? categoryName(p.category, locale) : "—"}
                  {p.maker ? ` · @${p.maker.username}` : ""} ·{""}
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
