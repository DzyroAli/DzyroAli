import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NotificationToggle } from "@/components/NotificationToggle";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });
  return { title: t("title") };
}

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const tc = await getTranslations("common");
  const { profile } = await getCurrentUser();
  const needsLogin = isSupabaseConfigured() && !profile;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-2.5">
        <Settings size={24} className="text-slate-500" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("title")}
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t("subtitle")}
      </p>

      <div className="mt-8">
        {needsLogin ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-slate-700 dark:text-slate-200">
              {t("loginRequired")}
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white"
            >
              {tc("login")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {t("notifications")}
            </h2>
            <NotificationToggle
              initialEnabled={profile?.comment_notifications ?? true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
