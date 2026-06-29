"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Globe } from "lucide-react";

const languageNames: Record<string, string> = {
  uz: "Ўзбек",
  ru: "Русский",
  en: "English",
};

export function LocaleSwitcher() {
  const pathname = usePathname();

  return (
    <details className="dropdown relative">
      <summary
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:text-slate-900"
        aria-label="Select language"
      >
        <Globe size={18} />
      </summary>
      <div className="dropdown-panel absolute right-0 top-full mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg">
        {routing.locales.map((l) => (
          <Link
            key={l}
            href={pathname}
            locale={l}
            className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 first:rounded-t-lg last:rounded-b-lg"
          >
            {languageNames[l] || l}
          </Link>
        ))}
      </div>
    </details>
  );
}
