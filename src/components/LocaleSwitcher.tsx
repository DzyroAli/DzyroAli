"use client";

import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { focusRing } from "./ui/Button";

const LOCALE_NAMES: Record<string, string> = {
  uz: "O‘zbekcha",
  ru: "Русский",
  en: "English",
};

export function LocaleSwitcher() {
  const pathname = usePathname();
  const active = useLocale();
  const t = useTranslations("common");

  return (
    <details className="dropdown relative">
      <summary
        className={cn(
          "flex h-9 items-center gap-1 rounded-lg border border-line bg-surface px-2.5 text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink",
          focusRing
        )}
        aria-label={t("language")}
      >
        {active.toUpperCase()}
        <ChevronDown size={14} aria-hidden />
      </summary>
      <div className="dropdown-panel absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lg">
        {routing.locales.map((locale) => (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            aria-current={locale === active ? "true" : undefined}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-muted",
              locale === active ? "font-semibold text-ink" : "text-ink-muted"
            )}
          >
            {LOCALE_NAMES[locale] ?? locale}
            <span className="text-[11px] font-semibold text-ink-subtle">
              {locale.toUpperCase()}
            </span>
          </Link>
        ))}
      </div>
    </details>
  );
}
