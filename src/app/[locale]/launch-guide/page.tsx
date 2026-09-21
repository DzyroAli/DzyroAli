import { CheckCircle2, Rocket } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guide" });
  return { title: t("title") };
}

/** Гид по запуску: как опубликовать продукт и собрать голоса. */
export default async function LaunchGuidePage() {
  const t = await getTranslations("guide");
  const steps = [1, 2, 3, 4, 5] as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink">
        <Rocket size={14} /> {t("badge")}
      </span>
      <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
        {t("title")}
      </h1>
      <p className="mt-2 text-ink-muted">{t("subtitle")}</p>

      <ol className="mt-8 space-y-5">
        {steps.map((n) => (
          <li
            key={n}
            className="flex gap-4 rounded-card border border-line bg-surface p-5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-on-brand">
              {n}
            </span>
            <span>
              <span className="block font-semibold text-ink">
                {t(`step${n}Title`)}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                {t(`step${n}Text`)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-card bg-brand p-6 text-on-brand">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 size={18} className="text-brand" />
          {t("readyTitle")}
        </p>
        <p className="mt-1.5 text-sm text-ink-subtle">{t("readyText")}</p>
        <Link
          href="/submit"
          className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand transition-opacity hover:opacity-90"
        >
          {t("readyCta")}
        </Link>
      </div>
    </div>
  );
}
