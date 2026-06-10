import { Medal, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLeaderboard } from "@/lib/data";
import { formatDate, gradientFor, initials } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });
  return { title: t("title") };
}

const MEDAL_TONE = ["text-amber-500", "text-slate-400", "text-orange-400"];

/** Лидерборд мейкеров: голоса за их одобренные продукты. */
export default async function LeaderboardPage() {
  const t = await getTranslations("leaderboard");
  const locale = await getLocale();
  const makers = await getLeaderboard(30);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-2.5">
        <Trophy size={24} className="text-amber-500" />
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

      {makers.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <div className="mt-6 space-y-2.5">
          {makers.map((m, i) => (
            <Link
              key={m.profile.id}
              href={`/makers/${m.profile.username}`}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-md"
            >
              <span className="w-7 text-center">
                {i < 3 ? (
                  <Medal size={20} className={`inline ${MEDAL_TONE[i]}`} />
                ) : (
                  <span className="text-sm font-bold text-slate-400">
                    {i + 1}
                  </span>
                )}
              </span>
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${gradientFor(m.profile.username)}`}
              >
                {initials(m.profile.full_name ?? m.profile.username)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-slate-900">
                  {m.profile.full_name ?? m.profile.username}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  @{m.profile.username} ·{" "}
                  {t("joined", {
                    date: formatDate(m.profile.created_at, locale),
                  })}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-lg font-extrabold text-teal-700">
                  {m.votes}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {t("votes")} · {m.products} {t("products")}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
