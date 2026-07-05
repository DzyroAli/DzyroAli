"use client";

import { useTranslations } from "next-intl";
import { useTelegram } from "@/components/TelegramProvider";
import { BottomNav } from "@/components/BottomNav";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user, cloudStorage } = useTelegram();

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>

      {user && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-tg-bg-secondary p-4">
          {user.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tg-button text-lg font-bold text-tg-button-text">
              {user.firstName.charAt(0) || "?"}
            </div>
          )}
          <div>
            <p className="font-semibold">{user.firstName}</p>
            {user.username && <p className="text-sm text-tg-hint">@{user.username}</p>}
          </div>
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-tg-hint">{t("language")}</h2>
        <LocaleSwitcher />
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-tg-hint">{t("storage")}</h2>
        <p className="rounded-2xl bg-tg-bg-secondary p-4 text-sm">
          {cloudStorage ? `☁️ ${t("storageCloud")}` : `📱 ${t("storageLocal")}`}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-medium text-tg-hint">{t("about")}</h2>
        <p className="rounded-2xl bg-tg-bg-secondary p-4 text-sm leading-relaxed">{t("aboutText")}</p>
        <p className="mt-3 text-center text-xs text-tg-hint">
          {t("version")} 0.1.0 · Slaydchibot
        </p>
      </section>

      <BottomNav />
    </main>
  );
}
