import { MessageCircle, Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { categoryName, type Product } from "@/lib/types";
import { ProductLogo } from "./ProductLogo";
import { VoteButton } from "./VoteButton";

export async function ProductCard({
  product,
  rank,
}: {
  product: Product;
  rank?: number;
}) {
  const locale = await getLocale();
  const t = await getTranslations("common");

  return (
    <article className="group relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
      {rank !== undefined && (
        <span className="hidden w-6 text-center text-sm font-semibold text-slate-400 sm:block">
          {rank}
        </span>
      )}
      <ProductLogo name={product.name} logoUrl={product.logo_url} size={56} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">
          <Link
            href={`/products/${product.slug}`}
            className="after:absolute after:inset-0 group-hover:text-teal-700"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
          {product.tagline}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {product.category && (
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>
                {CATEGORY_EMOJI[product.category.slug] ?? "✨"}
              </span>
              {categoryName(product.category, locale)}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={12} />
            {product.comments_count} {t("comments")}
          </span>
          {(product.rating_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {((product.rating_sum ?? 0) / (product.rating_count ?? 1)).toFixed(
                1
              )}
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10">
        <VoteButton
          productId={product.id}
          initialVotes={product.votes_count}
        />
      </div>
    </article>
  );
}
