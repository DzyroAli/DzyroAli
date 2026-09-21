import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/Button";
import { RadarLogo } from "@/components/ui/RadarLogo";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <RadarLogo size={56} className="mx-auto text-brand opacity-70" />
      <p className="mt-5 text-sm font-medium text-ink-muted">404</p>
      <h1 className="mt-1 text-xl font-semibold text-ink">{t("notFound")}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t("notFoundText")}</p>
      <Link href="/" className={buttonClass("primary", "md", "mt-6")}>
        {t("goHome")}
      </Link>
    </div>
  );
}
