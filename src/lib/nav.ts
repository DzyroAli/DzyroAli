import {
  Coins,
  Compass,
  Handshake,
  LayoutGrid,
  MapPin,
  Send,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** Key into the `nav` message namespace. */
  key: string;
  href: string;
  icon: LucideIcon;
  /** Also mark active for these path prefixes. */
  matches?: string[];
}

/**
 * Primary navigation. Every entry points at a route that exists and returns
 * real content — there is deliberately no "for sale" section, because the
 * schema has no such flag and an always-empty section is noise.
 */
export const NAV_ITEMS: NavItem[] = [
  { key: "today", href: "/", icon: Compass },
  { key: "catalog", href: "/products", icon: LayoutGrid },
  { key: "leaderboard", href: "/leaderboard", icon: Trophy },
  { key: "community", href: "/makers", icon: Users },
  { key: "map", href: "/map", icon: MapPin },
  { key: "telegram", href: "/category/telegram-bots", icon: Send },
  { key: "investment", href: "/category/seeking-investment", icon: Coins },
  { key: "partners", href: "/category/seeking-partners", icon: Handshake },
];

/** Locale-agnostic active check: `pathname` is already stripped of the locale. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const candidates = [item.href, ...(item.matches ?? [])];
  return candidates.some((href) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
  );
}
