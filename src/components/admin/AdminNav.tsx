"use client";

import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Сайдбар админки с подсветкой активного раздела. */
export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  const items = [
    { href: "/admin", icon: LayoutDashboard, label: t("navOverview") },
    { href: "/admin/moderation", icon: Inbox, label: t("navModeration") },
    { href: "/admin/users", icon: Users, label: t("navUsers") },
    { href: "/admin/analytics", icon: BarChart3, label: t("navAnalytics") },
    { href: "/admin/settings", icon: Settings, label: t("navSettings") },
  ] as const;

  return (
    <aside className="shrink-0 lg:w-56">
      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={16} className={active ? "text-teal-600" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
