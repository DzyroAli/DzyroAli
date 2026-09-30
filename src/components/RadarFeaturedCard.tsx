import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categoryName, type Product } from "@/lib/types";
import { Avatar } from "./ui/Avatar";
import { VoteButton } from "./VoteButton";

/** Faint concentric arcs — the radar motif, as background texture only. */
function RadarBackdrop() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 320"
      className="pointer-events-none absolute -right-16 -top-20 h-[320px] w-[320px] text-on-brand opacity-[0.16] sm:-right-10"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="160" cy="160" r="60" />
        <circle cx="160" cy="160" r="105" />
        <circle cx="160" cy="160" r="150" />
        <path d="M160 160 L272 48" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * The editorial pick. One product, presented on brand — deliberately not a
 * marketing banner: same information as a card, more room.
 */
export async function RadarFeaturedCard({
  product,
  voted = false,
}: {
  product: Product;
  voted?: boolean;
}) {
  const locale = await getLocale();
  const t = await getTranslations("home");

  return (
    <section className="on-brand group relative overflow-hidden rounded-2xl bg-brand p-5 text-on-brand sm:p-7">
      <RadarBackdrop />

      <div className="relative">
        <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-on-brand/80">
          <span className="h-2 w-2 shrink-0 rounded-full bg-on-brand/70" aria-hidden />
          {t("featuredLabel")}
          {product.category && (
            <>
              <span aria-hidden>·</span>
              <span>{categoryName(product.category, locale)}</span>
            </>
          )}
        </p>

        <h2 className="mt-3 max-w-2xl text-[22px] font-semibold leading-tight tracking-tight sm:text-[28px]">
          <Link
            href={`/products/${product.slug}`}
            className="rounded"
          >
            {product.name}
          </Link>
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-brand/85 sm:text-[15px]">
          {product.tagline}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          {product.maker ? (
            <Link
              href={`/makers/${product.maker.username}`}
              className="flex min-w-0 items-center gap-2.5 rounded-lg text-sm text-on-brand/90 transition-colors hover:text-on-brand"
            >
              <Avatar
                name={product.maker.full_name ?? product.maker.username}
                username={product.maker.username}
                src={product.maker.avatar_url}
                size={32}
                className="border border-on-brand/25"
              />
              <span className="truncate">
                {t("featuredBy", {
                  name: product.maker.full_name ?? product.maker.username,
                })}
              </span>
            </Link>
          ) : (
            <span />
          )}

          <div className="shrink-0">
            <VoteButton
              productId={product.id}
              initialVotes={product.votes_count}
              initialVoted={voted}
              tone="onBrand"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
