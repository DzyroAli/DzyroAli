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
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-600 p-8 text-white shadow-xl sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
          <PartyPopper size={14} /> {t("badge")}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-teal-50 sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      {/* Живые счётчики первого дня */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {counters.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center"
          >
            <c.icon size={18} className="mx-auto text-teal-600" />
            <p className="mt-1.5 text-2xl font-extrabold text-slate-900">
              {c.value}
            </p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Манифест */}
      <div className="prose-slate mt-10 space-y-4 text-[15px] leading-relaxed text-slate-700">
        <h2 className="text-xl font-bold text-slate-900">
          {t("manifestoTitle")}
        </h2>
        <p>{t("manifesto1")}</p>
        <p>{t("manifesto2")}</p>
        <p>{t("manifesto3")}</p>
        <p className="font-semibold text-slate-900">{t("manifestoCta")}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/submit"
          className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          🚀 {t("ctaSubmit")}
        </Link>
        <Link
          href="/products"
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          {t("ctaBrowse")}
        </Link>
      </div>
    </div>
  );
}
