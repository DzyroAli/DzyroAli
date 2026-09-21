import { Bookmark, LogOut, Plus, Settings, Shield, User } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { LoginButton } from "@/components/auth/LoginButton";
import { HeaderSearch } from "@/components/HeaderSearch";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass, focusRing } from "@/components/ui/Button";
import { RadarLogo } from "@/components/ui/RadarLogo";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/actions";
import { getCurrentUser } from "@/lib/data";
import { cn } from "@/lib/utils";

const menuItem =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-muted";

export async function TopBar() {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const { profile } = await getCurrentUser();
  // Native <form action> isn't locale-aware the way the i18n <Link> is.
  const searchAction = `${locale === "uz" ? "" : `/${locale}`}/products`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-5">
        <Link
          href="/"
          className={cn("flex shrink-0 items-center gap-2 rounded-lg", focusRing)}
        >
          <RadarLogo size={26} className="text-brand" />
          <span className="text-[17px] font-semibold tracking-tight text-ink">
            YaRato
          </span>
        </Link>

        <div className="ml-2 hidden min-w-0 flex-1 md:block">
          <div className="max-w-sm">
            <HeaderSearch
              action={searchAction}
              placeholder={t("searchPlaceholder")}
              hotkey
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LocaleSwitcher />
          {/* Space is tight at 320px; the footer carries the toggle there. */}
          <span className="hidden sm:block">
            <ThemeSwitcher />
          </span>

          <Link href="/submit" className={buttonClass("primary", "md", "px-3 sm:px-4")}>
            <Plus size={16} strokeWidth={2.5} aria-hidden />
            <span className="hidden sm:inline">{t("submit")}</span>
            <span className="sr-only sm:hidden">{t("submit")}</span>
          </Link>

          {profile ? (
            <details className="dropdown relative">
              <summary
                className={cn("flex items-center rounded-full", focusRing)}
                aria-label={t("menu")}
              >
                <Avatar
                  name={profile.full_name ?? profile.username}
                  username={profile.username}
                  src={profile.avatar_url}
                  size={36}
                />
              </summary>
              <div className="dropdown-panel absolute right-0 top-full mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-lg">
                <p className="truncate px-3 pb-1.5 pt-1 text-xs text-ink-muted">
                  @{profile.username}
                </p>
                <Link href={`/makers/${profile.username}`} className={menuItem}>
                  <User size={15} aria-hidden /> {t("myProfile")}
                </Link>
                <Link href="/bookmarks" className={menuItem}>
                  <Bookmark size={15} aria-hidden /> {t("bookmarks")}
                </Link>
                <Link href="/settings" className={menuItem}>
                  <Settings size={15} aria-hidden /> {t("settings")}
                </Link>
                {profile.role === "admin" && (
                  <Link href="/admin" className={menuItem}>
                    <Shield size={15} aria-hidden /> {t("admin")}
                  </Link>
                )}
                <form action={signOut}>
                  <button
                    type="submit"
                    className={cn(menuItem, "text-critical hover:bg-critical-soft")}
                  >
                    <LogOut size={15} aria-hidden /> {t("logout")}
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <HeaderSearch action={searchAction} placeholder={t("searchPlaceholder")} />
      </div>
    </header>
  );
}
