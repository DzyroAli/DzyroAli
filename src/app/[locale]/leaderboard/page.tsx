import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageBody } from "@/components/shell/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "@/i18n/navigation";
import { getLeaderboard } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });
  return { title: t("title") };
}

/** Лидерборд мейкеров: голоса за их одобренные продукты. */
export default async function LeaderboardPage() {
  const t = await getTranslations("leaderboard");
  const locale = await getLocale();
  const makers = await getLeaderboard(30);

  return (
    <PageBody>
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">{t("subtitle")}</p>
      </header>

      {makers.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t("empty")} />
        </div>
      ) : (
        <ol className="mt-6 space-y-2.5">
          {makers.map((m, i) => (
            <li key={m.profile.id}>
              <Link
                href={`/makers/${m.profile.username}`}
                className="flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 transition-colors hover:border-line-strong"
              >
                {/* Rank weight carries the ordering; no medal colours. */}
                <span
                  className={cn(
                    "w-6 shrink-0 text-center text-sm tabular-nums",
                    i < 3 ? "font-semibold text-brand" : "text-ink-subtle"
                  )}
                >
                  {i + 1}
                </span>
                <Avatar
                  name={m.profile.full_name ?? m.profile.username}
                  username={m.profile.username}
                  src={m.profile.avatar_url}
                  size={42}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">
                    {m.profile.full_name ?? m.profile.username}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">
                    @{m.profile.username} ·{" "}
                    {t("joined", {
                      date: formatDate(m.profile.created_at, locale),
                    })}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-base font-semibold tabular-nums text-ink">
                    {m.votes}
                  </span>
                  <span className="block text-[11px] text-ink-muted">
                    {t("votes")} · {m.products} {t("products")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </PageBody>
  );
}
