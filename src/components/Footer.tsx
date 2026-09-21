import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RadarLogo } from "./ui/RadarLogo";
import { SubscribeForm } from "./SubscribeForm";
import { ThemeSwitcher } from "./ThemeSwitcher";

const linkCls = "text-ink-muted transition-colors hover:text-ink";

/**
 * Compact footer. Primary navigation lives in the left rail now, so this is
 * just the brand line, legal links and the mailing-list form.
 */
export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");

  return (
    <footer className="mt-10 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 rounded-lg"
          >
            <RadarLogo size={22} className="text-brand" />
            <span className="font-semibold tracking-tight text-ink">YaRato</span>
          </Link>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
            {t("description")}
          </p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-sm font-semibold text-ink">{t("subscribe")}</h2>
          <p className="mb-3 mt-1.5 text-sm text-ink-muted">{t("subscribeText")}</p>
          <SubscribeForm compact />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-4 text-xs text-ink-muted sm:justify-between">
          <p>
            © {new Date().getFullYear()} YaRato — {t("rights")}
          </p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="sm:hidden">
              <ThemeSwitcher />
            </span>
            <Link href="/about" className={linkCls}>
              {t("about")}
            </Link>
            <Link href="/launch-guide" className={linkCls}>
              {tn("launchGuide")}
            </Link>
            <Link href="/privacy" className={linkCls}>
              {t("privacy")}
            </Link>
            <Link href="/terms" className={linkCls}>
              {t("terms")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
