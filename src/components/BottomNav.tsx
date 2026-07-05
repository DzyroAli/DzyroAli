"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTelegram } from "./TelegramProvider";

const items = [
  { href: "/", key: "home", icon: "🖼" },
  { href: "/templates", key: "templates", icon: "✨" },
  { href: "/settings", key: "settings", icon: "⚙️" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { haptic } = useTelegram();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-tg-bg pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => haptic("light")}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                active ? "text-tg-link" : "text-tg-hint"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
