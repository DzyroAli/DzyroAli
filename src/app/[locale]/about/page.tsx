import {
  Heart,
  MessageSquare,
  Package,
  PartyPopper,
  Rocket,
  ThumbsUp,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLaunchDayStats, getStats } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle"), description: t("manifesto1") };
}

/** «Мы запустились сегодня!» — манифест сообщества + живые счётчики дня 1. */
export default async function AboutPage() {
  const t = await getTranslations("about");
  const [stats, launch] = await Promise.all([getStats(), getLaunchDayStats()]);

  const counters = [
    { label: t("counterProducts"), value: stats.totalProducts, icon: Package },
    { label: t("counterMakers"), value: stats.totalUsers, icon: Users },
    { label: t("counterVotes"), value: stats.totalVotes, icon: ThumbsUp },
    {
      label: t("counterComments"),
      value: stats.totalComments,
      icon: MessageSquare,
    },
    { label: t("counterToday"), value: launch.productsToday, icon: Rocket },
    { label: t("counterSignups"), value: launch.signupsToday, icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Баннер запуска */}
      <div className="overflow-hidden rounded-card bg-brand p-6 text-on-brand sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-on-brand/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">
          <PartyPopper size={13} aria-hidden /> {t("badge")}
        </span>
        <h1 className="mt-4 text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-brand/85 sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      {/* Живые счётчики первого дня */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {counters.map((c) => (
          <div
            key={c.label}
            className="rounded-card border border-line bg-surface p-4 text-center"
          >
            <c.icon size={18} className="mx-auto text-brand" />
            <p className="mt-1.5 text-2xl font-semibold text-ink">
              {c.value}
            </p>
            <p className="text-xs text-ink-muted">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Манифест */}
      <div className="mt-10 space-y-4 text-[15px] leading-relaxed text-ink">
        <h2 className="text-xl font-semibold text-ink">
          {t("manifestoTitle")}
        </h2>
        <p>{t("manifesto1")}</p>
        <p>{t("manifesto2")}</p>
        <p>{t("manifesto3")}</p>
        <p className="font-semibold text-ink">{t("manifestoCta")}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/submit"
          className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand shadow-sm transition-opacity hover:opacity-90"
        >
          {t("ctaSubmit")}
        </Link>
        <Link
          href="/products"
          className="rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong hover:bg-surface-muted"
        >
          {t("ctaBrowse")}
        </Link>
      </div>
    </div>
  );
}
