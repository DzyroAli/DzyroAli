import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("privacyTitle") };
}

/** Политика конфиденциальности. */
export default async function PrivacyPage() {
  const t = await getTranslations("legal");
  const sections = [1, 2, 3, 4, 5] as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">
        {t("privacyTitle")}
      </h1>
      <p className="mt-2 text-sm text-slate-400">{t("updated")}</p>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-slate-700">
        {sections.map((n) => (
          <section key={n}>
            <h2 className="mb-1.5 font-bold text-slate-900">
              {n}. {t(`privacy${n}Title`)}
            </h2>
            <p>{t(`privacy${n}Text`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
