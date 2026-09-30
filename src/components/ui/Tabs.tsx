import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface TabLinkItem {
  key: string;
  label: ReactNode;
  href: string;
}

const itemBase =
  "rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap";

/**
 * Segmented control built from links, so it works without client state and
 * keeps the current view shareable via the URL.
 */
export function TabLinks({
  items,
  active,
  label,
  className,
}: {
  items: TabLinkItem[];
  active: string;
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 rounded-xl border border-line bg-surface p-1",
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              itemBase,
              isActive
                ? "bg-brand-soft text-ink"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Underlined tab strip for in-page sections (profile tabs). */
export function TabStrip({
  items,
  active,
  label,
  className,
}: {
  items: TabLinkItem[];
  active: string;
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn("-mb-px flex gap-1 overflow-x-auto border-b border-line", className)}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
