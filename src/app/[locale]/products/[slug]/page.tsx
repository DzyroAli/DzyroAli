import { ExternalLink, Send } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CommentSection } from "@/components/CommentSection";
import { ProductCard } from "@/components/ProductCard";
import { ProductLogo } from "@/components/ProductLogo";
import { VoteButton } from "@/components/VoteButton";
import { CATEGORY_EMOJI } from "@/lib/categories";
import {
  getComments,
  getCurrentUser,
  getProductBySlug,
  getSimilar,
  hasVoted,
} from "@/lib/data";
import { categoryName } from "@/lib/types";
import { formatDate, gradientFor, initials } from "@/lib/utils";

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
      ...(product.logo_url ? { images: [product.logo_url] } : {}),
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
  const [comments, voted, similar, { userId }] = await Promise.all([
    getComments(product.id),
    hasVoted(product.id),
    getSimilar(product),
    getCurrentUser(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.tagline,
    url: `${SITE_URL}/products/${product.slug}`,
    applicationCategory: product.category?.name_en,
    aggregateRating:
      product.votes_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: 5,
            ratingCount: product.votes_count,
          }
        : undefined,
    author: product.maker
      ? {
          "@type": "Person",
          name: product.maker.full_name ?? product.maker.username,
        }
      : undefined,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {product.status === "pending" && (
        <p className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {t("pendingNotice")}
        </p>
      )}

      {/* Hero */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <ProductLogo name={product.name} logoUrl={product.logo_url} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {product.name}
          </h1>
          <p className="mt-1.5 text-lg text-slate-600">{product.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            {product.category && (
              <Link
                href={`/category/${product.category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 hover:bg-slate-200"
              >
                <span aria-hidden>{CATEGORY_EMOJI[product.category.slug]}</span>
                {categoryName(product.category, locale)}
              </Link>
            )}
            <span>
              {t("launched")}: {formatDate(product.launched_at, locale)}
            </span>
          </div>
        </div>
        <VoteButton
          productId={product.id}
          initialVotes={product.votes_count}
          initialVoted={voted}
          size="lg"
        />
      </div>

      {/* Action links */}
      <div className="mt-6 flex flex-wrap gap-3">
        {product.website_url && (
          <a
            href={product.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <ExternalLink size={15} />
            {t("visit")}
          </a>
        )}
        {product.telegram_url && (
          <a
            href={product.telegram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-5 py-2.5 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100"
          >
            <Send size={15} />
            {t("openTelegram")}
          </a>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-10">
          {product.description && (
            <div className="whitespace-pre-line rounded-2xl border border-slate-200 bg-white p-6 text-[15px] leading-relaxed text-slate-700">
              {product.description}
            </div>
          )}

          <CommentSection
            productId={product.id}
            comments={comments}
            canComment={Boolean(userId)}
          />
        </div>

        <aside className="space-y-8">
          {product.maker && (
            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                {t("maker")}
              </h3>
              <Link
                href={`/makers/${product.maker.username}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${gradientFor(product.maker.username)}`}
                >
                  {initials(product.maker.full_name ?? product.maker.username)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">
                    {product.maker.full_name ?? product.maker.username}
                  </span>
                  <span className="block truncate text-sm text-slate-500">
                    @{product.maker.username}
                  </span>
                </span>
              </Link>
            </section>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            {t("similar")}
          </h2>
          <div className="space-y-3">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
