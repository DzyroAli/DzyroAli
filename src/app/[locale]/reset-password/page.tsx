import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "login" });
  return { title: t("resetTitle"), robots: { index: false } };
}

/** Страница установки нового пароля после перехода по ссылке из письма. */
export default async function ResetPasswordPage() {
  const t = await getTranslations("login");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-card border border-line bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <KeyRound size={22} aria-hidden />
          </span>
          <h1 className="text-xl font-semibold text-ink">{t("resetTitle")}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{t("resetSubtitle")}</p>
        </div>
        <NewPasswordForm />
      </div>
    </div>
  );
}
