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
        <Upload size={22} className="text-teal-600" />
        <h1 className="text-2xl font-bold text-slate-900">{t("importTitle")}</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">{t("importSubtitle")}</p>
      <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-500">
        {t("importHint")}
      </p>

      <div className="mt-5">
        <ImportForm />
      </div>
    </div>
  );
}
