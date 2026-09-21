import Image from "next/image";
import { categoryIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * Product mark: the uploaded logo when present, otherwise the product's
 * category icon on a soft blue tile — deliberately uniform rather than a
 * per-product colour, so a feed of cards reads as one list.
 */
export function ProductLogo({
  name,
  logoUrl,
  categorySlug,
  size = 56,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  categorySlug?: string;
  size?: number;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={cn(
          "shrink-0 rounded-xl border border-line bg-surface object-cover",
          className
        )}
      />
    );
  }

  const Icon = categoryIcon(categorySlug);

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand",
        className
      )}
      aria-hidden
    >
      <Icon size={Math.round(size * 0.42)} strokeWidth={1.75} />
    </span>
  );
}
