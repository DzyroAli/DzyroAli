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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
            <KeyRound size={22} />
          </span>
          <h1 className="text-xl font-bold text-slate-900">{t("resetTitle")}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{t("resetSubtitle")}</p>
        </div>
        <NewPasswordForm />
      </div>
    </div>
  );
}
