import { createElement } from "react";
import { categoryIcon } from "@/lib/categories";

/**
 * Renders the icon for a category slug.
 *
 * Built with `createElement` rather than a capitalised local + JSX: the icon is
 * picked from a fixed module-level map, but assigning it to a local inside a
 * component body reads as creating a component during render.
 */
export function CategoryIcon({
  slug,
  size = 14,
  strokeWidth,
  className,
}: {
  slug: string | undefined;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return createElement(categoryIcon(slug), {
    size,
    strokeWidth,
    className,
    "aria-hidden": true,
  });
}
