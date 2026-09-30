import { Calendar, Globe, MapPin, MessageCircle, Send } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/ProductCard";
import { PageBody } from "@/components/shell/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TabStrip } from "@/components/ui/Tabs";
import { Link } from "@/i18n/navigation";
import { cityLabel, COUNTRY_NAME, findCity } from "@/lib/cities";
import { getMaker, getMakerComments, getVotedProductIds } from "@/lib/data";
import type { Locale } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

const TABS = ["projects", "launches", "activity", "about"] as const;
type Tab = (typeof TABS)[number];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const maker = await getMaker(username);
  if (!maker) return {};
  return {
    title: maker.profile.full_name ?? maker.profile.username,
    description: maker.profile.bio ?? undefined,
  };
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-lg font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}

export default async function MakerPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { username } = await params;
  const { tab: rawTab } = await searchParams;
  const maker = await getMaker(username);
  if (!maker) notFound();

  const tab: Tab = TABS.includes(rawTab as Tab) ? (rawTab as Tab) : "projects";
  const { profile, products } = maker;
  const t = await getTranslations("maker");
  const locale = await getLocale();
  const displayName = profile.full_name ?? profile.username;

  const city = cityLabel(profile.city, locale);
  const country = findCity(profile.city)
    ? COUNTRY_NAME[locale as Locale] ?? COUNTRY_NAME.en
    : null;

  const totalVotes = products.reduce((sum, p) => sum + p.votes_count, 0);
  const totalComments = products.reduce((sum, p) => sum + p.comments_count, 0);

  const [voted, activity] = await Promise.all([
    getVotedProductIds(products.map((p) => p.id)),
    tab === "activity" ? getMakerComments(profile.id) : Promise.resolve([]),
  ]);

  const launches = [...products].sort(
    (a, b) => +new Date(b.launched_at) - +new Date(a.launched_at)
  );

  const tabItems = TABS.map((key) => ({
    key,
    label: t(`tab_${key}`),
    href:
      key === "projects"
        ? `/makers/${username}`
        : `/makers/${username}?tab=${key}`,
  }));

  return (
    <PageBody>
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar
            name={displayName}
            username={profile.username}
            src={profile.avatar_url}
            size={72}
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]">
              {displayName}
            </h1>
            <p className="text-sm text-ink-muted">@{profile.username}</p>

            {profile.bio && (
              <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-ink">
                {profile.bio}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
              {city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} aria-hidden />
                  {country ? `${city}, ${country}` : city}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded text-brand-ink hover:underline"
                >
                  <Globe size={14} aria-hidden />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {profile.telegram_username && (
                <a
                  href={`https://t.me/${profile.telegram_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded text-brand-ink hover:underline"
                >
                  <Send size={14} aria-hidden />@{profile.telegram_username}
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-6 sm:flex-col sm:gap-3 sm:border-l sm:border-line sm:pl-6">
            <Stat value={products.length} label={t("statProducts")} />
            <Stat value={totalVotes} label={t("statVotes")} />
            <Stat value={totalComments} label={t("statComments")} />
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <TabStrip items={tabItems} active={tab} label={t("tabsLabel")} />
      </div>

      <div className="mt-5">
        {tab === "projects" &&
          (products.length === 0 ? (
            <EmptyState title={t("noProducts")} />
          ) : (
            <div className="space-y-2.5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} voted={voted.has(p.id)} />
              ))}
            </div>
          ))}

        {tab === "launches" &&
          (launches.length === 0 ? (
            <EmptyState title={t("noProducts")} />
          ) : (
            <ol className="space-y-2.5">
              {launches.map((p) => (
                <li key={p.id}>
                  <Card className="flex flex-wrap items-center justify-between gap-2 p-4">
                    <Link
                      href={`/products/${p.slug}`}
                      className="min-w-0 rounded text-sm font-medium text-ink hover:text-brand-ink"
                    >
                      {p.name}
                    </Link>
                    <time
                      dateTime={p.launched_at}
                      className="shrink-0 text-xs text-ink-muted"
                    >
                      {formatDate(p.launched_at, locale)}
                    </time>
                  </Card>
                </li>
              ))}
            </ol>
          ))}

        {tab === "activity" &&
          (activity.length === 0 ? (
            <EmptyState title={t("noActivity")} />
          ) : (
            <ul className="space-y-2.5">
              {activity.map(({ comment, product }) => (
                <li key={comment.id}>
                  <Card className="p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-muted">
                      {product ? (
                        <Link
                          href={`/products/${product.slug}`}
                          className="rounded font-medium text-brand-ink hover:underline"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <span />
                      )}
                      <time
                        dateTime={comment.created_at}
                        suppressHydrationWarning
                      >
                        {timeAgo(comment.created_at, locale)}
                      </time>
                    </div>
                    <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink">
                      {comment.content}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          ))}

        {tab === "about" && (
          <Card className="space-y-4 p-5">
            {profile.bio ? (
              <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-ink">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-ink-muted">{t("noBio")}</p>
            )}
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-ink-muted">
                <Calendar size={14} aria-hidden />
                <dt className="sr-only">{t("joined")}</dt>
                <dd>
                  {t("joined")}: {formatDate(profile.created_at, locale)}
                </dd>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <MessageCircle size={14} aria-hidden />
                <dt className="sr-only">{t("statComments")}</dt>
                <dd>
                  {totalComments} {t("statComments")}
                </dd>
              </div>
            </dl>
          </Card>
        )}
      </div>
    </PageBody>
  );
}
