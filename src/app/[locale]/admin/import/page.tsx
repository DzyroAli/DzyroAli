import { Upload } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ImportForm } from "@/components/admin/ImportForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("navImport"), robots: { index: false, follow: false } };
}

export default async function AdminImportPage() {
  const t = await getTranslations("admin");

  return (
    <div>
      <div className="flex items-center gap-2">
        <Upload size={22} className="text-brand" />
        <h1 className="text-2xl font-semibold text-ink">{t("importTitle")}</h1>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{t("importSubtitle")}</p>
      <p className="mt-4 rounded-card bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-muted">
        {t("importHint")}
      </p>

      <div className="mt-5">
        <ImportForm />
      </div>
    </div>
  );
}
