import { MapPin, MessageCircle, Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categoryIcon } from "@/lib/categories";
import { cityLabel } from "@/lib/cities";
import { categoryName, type Product } from "@/lib/types";
import { ProductLogo } from "./ProductLogo";
import { Badge } from "./ui/Badge";
import { VoteButton } from "./VoteButton";

/**
 * Feed card. Shows only fields the schema actually carries — no invented
 * stage/price/metric badges — and never more than two badges at once.
 *
 * The click target is a stretched link: `group relative` here, `after:inset-0`
 * on the title link, and the vote button lifted to `z-10` so it stays
 * clickable. Changing any one of those three breaks the other two.
 */
export async function ProductCard({
  product,
  rank,
  voted = false,
}: {
  product: Product;
  rank?: number;
  voted?: boolean;
}) {
  const locale = await getLocale();
  const t = await getTranslations("common");
  const CategoryIcon = categoryIcon(product.category?.slug);
  const city = cityLabel(product.maker?.city, locale);
  const ratingCount = product.rating_count ?? 0;
  const rating =
    ratingCount > 0 ? (product.rating_sum ?? 0) / ratingCount : null;

  return (
    <article className="group relative flex items-center gap-3 rounded-card border border-line bg-surface p-3.5 transition-colors hover:border-line-strong has-[a:focus-visible]:border-brand sm:gap-4 sm:p-4">
      {rank !== undefined && (
        <span className="hidden w-5 shrink-0 text-center text-sm font-semibold text-ink-subtle sm:block">
          {rank}
        </span>
      )}

      <ProductLogo
        name={product.name}
        logoUrl={product.logo_url}
        categorySlug={product.category?.slug}
        size={52}
      />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold text-ink">
          <Link
            href={`/products/${product.slug}`}
            className="rounded after:absolute after:inset-0 after:rounded-card group-hover:text-brand-ink focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink-muted">
          {product.tagline}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {product.category && (
            <Badge icon={CategoryIcon}>{categoryName(product.category, locale)}</Badge>
          )}

          <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-muted">
            {product.maker && (
              <span className="truncate">
                {product.maker.full_name ?? product.maker.username}
              </span>
            )}
            {city && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} aria-hidden />
                {city}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={12} aria-hidden />
              {product.comments_count}
              <span className="sr-only"> {t("comments")}</span>
            </span>
            {rating !== null && (
              <span className="inline-flex items-center gap-1">
                <Star size={12} aria-hidden />
                {rating.toFixed(1)}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="relative z-10">
        <VoteButton
          productId={product.id}
          initialVotes={product.votes_count}
          initialVoted={voted}
        />
      </div>
    </article>
  );
}
