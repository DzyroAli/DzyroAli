"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTelegram } from "./TelegramProvider";

const locales = [
  { code: "uz", label: "O‘zbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { haptic } = useTelegram();

  function setLocale(code: string) {
    haptic("light");
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;SameSite=None;Secure`;
    startTransition(() => router.refresh());
  }

  return (
    <div className={`flex gap-2 ${pending ? "opacity-60" : ""}`}>
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            locale === l.code
              ? "bg-tg-button text-tg-button-text"
              : "bg-tg-bg-secondary text-tg-text"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
