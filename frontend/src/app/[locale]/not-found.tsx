import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-7xl font-extrabold text-teal-600">404</p>
      <h1 className="mt-4 text-xl font-bold text-slate-900">{t("notFound")}</h1>
      <p className="mt-2 text-sm text-slate-500">{t("notFoundText")}</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
      >
        {t("goHome")}
      </Link>
    </div>
  );
}
