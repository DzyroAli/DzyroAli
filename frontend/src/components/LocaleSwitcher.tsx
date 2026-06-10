"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          className={cn(
            "rounded-md px-2 py-1 uppercase transition-colors",
            l === locale
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
