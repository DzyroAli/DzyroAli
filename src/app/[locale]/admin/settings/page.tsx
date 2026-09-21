import { CheckCircle2, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CategoryEditor } from "@/components/admin/CategoryEditor";
import { getCategories } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Системные настройки: статус интеграций + редактирование категорий. */
export default async function AdminSettingsPage() {
  const t = await getTranslations("admin");
  const categories = await getCategories();

  const checks = [
    { label: "Supabase", ok: isSupabaseConfigured() },
    {
      label: t("settingTelegram"),
      ok: Boolean(
        process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME &&
          process.env.TELEGRAM_BOT_TOKEN
      ),
    },
    {
      label: t("settingServiceRole"),
      ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    {
      label: t("settingSiteUrl"),
      ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">{t("navSettings")}</h1>
      <p className="mt-1 text-sm text-ink-muted">{t("settingsSubtitle")}</p>

      <div className="mt-6 space-y-2">
        {checks.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-between rounded-card border border-line bg-surface px-4 py-3.5"
          >
            <span className="text-sm font-medium text-ink">{c.label}</span>
            {c.ok ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                <CheckCircle2 size={16} /> {t("settingOk")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                <XCircle size={16} /> {t("settingMissing")}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-card bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-muted">
        {t("settingsNote")}
      </p>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-ink">
          {t("categoriesTitle")}
        </h2>
        <p className="mb-4 mt-1 text-sm text-ink-muted">
          {t("categoriesHint")}
        </p>
        <CategoryEditor categories={categories} />
      </div>
    </div>
  );
}
