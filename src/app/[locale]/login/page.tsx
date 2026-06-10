import { Radar } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { MagicLinkForm } from "@/components/MagicLinkForm";
import { TelegramLogin } from "@/components/TelegramLogin";
import { getCurrentUser } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("loginTitle") };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await getCurrentUser();
  if (userId) {
    redirect({ href: "/", locale });
  }

  const t = await getTranslations("login");
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
            <Radar size={24} />
          </span>
          <h1 className="text-xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{t("subtitle")}</p>
        </div>

        {botUsername ? (
          <div className="space-y-3">
            <TelegramLogin botUsername={botUsername} />
            <p className="text-center text-xs text-slate-400">
              {t("telegramHint")}
            </p>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-xs text-slate-500">
            {t("telegramUnavailable")}
          </p>
        )}

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          {t("emailDivider")}
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <MagicLinkForm />
      </div>
    </div>
  );
}
