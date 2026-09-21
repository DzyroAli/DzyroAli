"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { isNavItemActive, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { focusRing } from "@/components/ui/Button";

/** Icon-only rail shown from `lg` up. */
export function SideNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("primary")}
      className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-[72px] shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-4 lg:flex"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(item, pathname);
        const label = t(item.key);
        return (
          <Link
            key={item.key}
            href={item.href}
            title={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
              focusRing,
              active
                ? "bg-brand-soft text-brand"
                : "text-ink-subtle hover:bg-surface-muted hover:text-ink"
            )}
          >
            <item.icon size={20} strokeWidth={active ? 2 : 1.75} aria-hidden />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Horizontal strip used below `lg`, where the rail would eat the viewport. */
export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("primary")}
      className="border-b border-line bg-surface lg:hidden"
    >
      <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                focusRing,
                active
                  ? "bg-brand-soft text-ink"
                  : "text-ink-muted hover:bg-surface-muted hover:text-ink"
              )}
            >
              <item.icon
                size={15}
                className={active ? "text-brand" : undefined}
                aria-hidden
              />
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
