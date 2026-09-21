import { ExternalLink, Send } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CommentSection } from "@/components/CommentSection";
import { ProductLogo } from "@/components/ProductLogo";
import { RatingStars } from "@/components/RatingStars";
import { ShareButtons } from "@/components/ShareButtons";
import { VoteButton } from "@/components/VoteButton";
import { PageBody } from "@/components/shell/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass, focusRing } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  getComments,
  getCurrentUser,
  getProductBySlug,
  getSimilar,
  getUserRating,
  hasVoted,
  isBookmarked,
} from "@/lib/data";
import { categoryName } from "@/lib/types";
import { cityLabel } from "@/lib/cities";
import { cn, formatDate } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://techradar.uz";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const path = `/products/${slug}`;
  return {
    title: `${product.name} — ${product.tagline}`,
    description: product.description?.slice(0, 160) ?? product.tagline,
    alternates: {
      canonical: locale === "uz" ? path : `/${locale}${path}`,
      languages: {
        uz: path,
        ru: `/ru${path}`,
        en: `/en${path}`,
        "x-default": path,
      },
    },
    openGraph: {
      type: "website",
      title: `${product.name} — ${product.tagline}`,
      description: product.description?.slice(0, 200) ?? product.tagline,
      url: `${SITE_URL}${locale === "uz" ? "" : `/${locale}`}${path}`,
      images: product.logo_url
        ? [
            {
              url: product.logo_url,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : undefined,
      siteName: "YaRato",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${product.tagline}`,
      description: product.description?.slice(0, 200) ?? product.tagline,
      images: product.logo_url ? [product.logo_url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const locale = await getLocale();
  const t = await getTranslations("product");
  const [comments, voted, bookmarked, userRating, similar, { userId, profile }] =
    await Promise.all([
      getComments(product.id),
      hasVoted(product.id),
      isBookmarked(product.id),
      getUserRating(product.id),
      getSimilar(product),
      getCurrentUser(),
    ]);

  const ratingCount = product.rating_count ?? 0;
  const ratingAvg = ratingCount > 0 ? (product.rating_sum ?? 0) / ratingCount : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.tagline,
    url: `${SITE_URL}/products/${product.slug}`,
    applicationCategory: product.category?.name_en,
    aggregateRating:
      ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(ratingAvg.toFixed(1)),
            ratingCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    author: product.maker
      ? {
          "@type": "Person",
          name: product.maker.full_name ?? product.maker.username,
        }
      : undefined,
  };

  const makerCity = cityLabel(product.maker?.city, locale);

  return (
    <PageBody>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {product.status === "pending" && (
        <p className="mb-5 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-ink">
          {t("pendingNotice")}
        </p>
      )}
      {/* Уведомление автору об отклонении с причиной от модератора */}
      {product.status === "rejected" && (
        <div className="mb-5 rounded-xl bg-critical-soft px-4 py-3 text-sm text-critical">
          <p className="font-semibold">{t("rejectedNotice")}</p>
          {product.rejection_reason && (
            <p className="mt-1">
              {t("rejectedReason")}: {product.rejection_reason}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="min-w-0">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ProductLogo
              name={product.name}
              logoUrl={product.logo_url}
              categorySlug={product.category?.slug}
              size={72}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
                {product.name}
              </h1>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-muted sm:text-base">
                {product.tagline}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
                {product.category && (
                  <Link
                    href={`/category/${product.category.slug}`}
                    className={cn("rounded-md", focusRing)}
                  >
                    <Badge
                      tone="brand"
                      icon={<CategoryIcon slug={product.category.slug} size={12} />}
                    >
                      {categoryName(product.category, locale)}
                    </Badge>
                  </Link>
                )}
                <span>
                  {t("launched")}: {formatDate(product.launched_at, locale)}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <VoteButton
                productId={product.id}
                initialVotes={product.votes_count}
                initialVoted={voted}
                size="lg"
              />
            </div>
          </header>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {product.website_url && (
              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary")}
              >
                <ExternalLink size={15} aria-hidden />
                {t("visit")}
              </a>
            )}
            {product.telegram_url && (
              <a
                href={product.telegram_url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("secondary")}
              >
                <Send size={15} aria-hidden />
                {t("openTelegram")}
              </a>
            )}
            <BookmarkButton
              productId={product.id}
              initialBookmarked={bookmarked}
            />
          </div>

          <Card className="mt-5 p-4">
            <RatingStars
              productId={product.id}
              initialAvg={ratingAvg}
              initialCount={ratingCount}
              initialUserRating={userRating}
            />
          </Card>

          <div className="mt-4">
            <ShareButtons
              url={`${SITE_URL}${locale === "uz" ? "" : `/${locale}`}/products/${product.slug}`}
              title={`${product.name} — ${product.tagline}`}
            />
          </div>

          {product.description && (
            <Card className="mt-6 whitespace-pre-line p-5 text-[15px] leading-relaxed text-ink">
              {product.description}
            </Card>
          )}

          <div className="mt-8">
            <CommentSection
              productId={product.id}
              comments={comments}
              canComment={Boolean(userId)}
              canModerate={profile?.role === "admin"}
            />
          </div>
        </div>

        <aside className="min-w-0 space-y-5">
          {product.maker && (
            <section>
              <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
                {t("maker")}
              </h2>
              <Link
                href={`/makers/${product.maker.username}`}
                className={cn(
                  "flex items-center gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong",
                  focusRing
                )}
              >
                <Avatar
                  name={product.maker.full_name ?? product.maker.username}
                  username={product.maker.username}
                  src={product.maker.avatar_url}
                  size={44}
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">
                    {product.maker.full_name ?? product.maker.username}
                  </span>
                  <span className="block truncate text-sm text-ink-muted">
                    @{product.maker.username}
                    {makerCity ? ` · ${makerCity}` : ""}
                  </span>
                </span>
              </Link>
            </section>
          )}

          {similar.length > 0 && (
            <section>
              <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
                {t("similar")}
              </h2>
              <ul className="space-y-1">
                {similar.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.slug}`}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-surface-muted",
                        focusRing
                      )}
                    >
                      <ProductLogo
                        name={p.name}
                        logoUrl={p.logo_url}
                        categorySlug={p.category?.slug}
                        size={36}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">
                          {p.name}
                        </span>
                        <span className="block truncate text-xs text-ink-muted">
                          {p.tagline}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </PageBody>
  );
}
