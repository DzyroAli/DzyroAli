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
      <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-teal-700">
        <Rocket size={14} /> {t("badge")}
      </span>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
        {t("title")}
      </h1>
      <p className="mt-2 text-slate-500">{t("subtitle")}</p>

      <ol className="mt-8 space-y-5">
        {steps.map((n) => (
          <li
            key={n}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-extrabold text-white">
              {n}
            </span>
            <span>
              <span className="block font-bold text-slate-900">
                {t(`step${n}Title`)}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                {t(`step${n}Text`)}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white">
        <p className="flex items-center gap-2 font-bold">
          <CheckCircle2 size={18} className="text-teal-400" />
          {t("readyTitle")}
        </p>
        <p className="mt-1.5 text-sm text-slate-300">{t("readyText")}</p>
        <Link
          href="/submit"
          className="mt-4 inline-block rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          {t("readyCta")}
        </Link>
      </div>
    </div>
  );
}
