import { Radar } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { AuthPanel } from "@/components/auth/AuthPanel";
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

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-card border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-5 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-on-brand">
            <Radar size={24} />
          </span>
          <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{t("subtitle")}</p>
        </div>
        <AuthPanel
          telegramBot={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}
        />
      </div>
    </div>
  );
}
