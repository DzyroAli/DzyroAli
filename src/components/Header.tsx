import { LogOut, Plus, Radar, Shield, User } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/actions";
import { getCurrentUser } from "@/lib/data";
import { gradientFor, initials } from "@/lib/utils";
import { LoginButton } from "./auth/LoginButton";
import { HeaderMenus } from "./HeaderMenus";
import { HeaderSearch } from "./HeaderSearch";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export async function Header() {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const { profile } = await getCurrentUser();
  const prefix = locale === "uz" ? "" : `/${locale}`;
  const searchAction = `${prefix}/products`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center gap-3 sm:gap-5">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
              <Radar size={20} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              TechRadar<span className="text-teal-600">.uz</span>
            </span>
          </Link>

          <HeaderMenus />

          <div className="hidden flex-1 justify-center md:flex">
            <div className="w-full max-w-md">
              <HeaderSearch
                action={searchAction}
                placeholder={t("searchPlaceholder")}
                hotkey
              />
            </div>
          </div>

          <nav className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/products"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 lg:block"
            >
              {t("products")}
            </Link>
            <LocaleSwitcher />
            <ThemeSwitcher />
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden sm:inline">{t("submit")}</span>
            </Link>

            {profile ? (
              <details className="dropdown relative">
                <summary
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${gradientFor(profile.username)}`}
                  aria-label={t("menu")}
                >
                  {initials(profile.full_name ?? profile.username)}
                </summary>
                <div className="dropdown-panel absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <Link
                    href={`/makers/${profile.username}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <User size={15} /> {t("myProfile")}
                  </Link>
                  {profile.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Shield size={15} /> {t("admin")}
                    </Link>
                  )}
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={15} /> {t("logout")}
                    </button>
                  </form>
                </div>
              </details>
            ) : (
              <LoginButton />
            )}
          </nav>
        </div>

        <div className="pb-3 md:hidden">
          <HeaderSearch
            action={searchAction}
            placeholder={t("searchPlaceholder")}
          />
        </div>
      </div>
    </header>
  );
}
