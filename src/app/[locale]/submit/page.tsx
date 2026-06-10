import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SubmitForm } from "@/components/SubmitForm";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("submitTitle") };
}

export default async function SubmitPage() {
  const t = await getTranslations("submit");
  const tc = await getTranslations("common");
  const { userId } = await getCurrentUser();
  const needsLogin = isSupabaseConfigured() && !userId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>

      <div className="mt-8">
        {needsLogin ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-700">{t("loginRequired")}</p>
            <Link
              href="/login"
              className="mt-5 inline-block rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white"
            >
              {tc("login")}
            </Link>
          </div>
        ) : (
          <SubmitForm />
        )}
      </div>
    </div>
  );
}
