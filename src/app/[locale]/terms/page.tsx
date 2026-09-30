import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("termsTitle") };
}

/** Пользовательское соглашение. */
export default async function TermsPage() {
  const t = await getTranslations("legal");
  const sections = [1, 2, 3, 4, 5] as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
        {t("termsTitle")}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{t("updated")}</p>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink">
        {sections.map((n) => (
          <section key={n}>
            <h2 className="mb-1.5 font-semibold text-ink">
              {n}. {t(`terms${n}Title`)}
            </h2>
            <p>{t(`terms${n}Text`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
