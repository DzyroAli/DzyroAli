import { Radar } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/lib/data";
import { categoryName } from "@/lib/types";
import { SubscribeForm } from "./SubscribeForm";

export async function Footer() {
  const t = await getTranslations("footer");
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const categories = getCategories();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
              <Radar size={17} />
            </span>
            <span className="font-bold">
              TechRadar<span className="text-teal-600">.uz</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {t("description")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t("navigation")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>
              <Link href="/products" className="hover:text-slate-900">
                {tc("products")}
              </Link>
            </li>
            <li>
              <Link href="/submit" className="hover:text-slate-900">
                {tc("submit")}
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-slate-900">
                {tc("login")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t("categories")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            {categories.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="hover:text-slate-900"
                >
                  {categoryName(c, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t("subscribe")}
          </h3>
          <p className="mb-3 mt-3 text-sm text-slate-500">{t("subscribeText")}</p>
          <SubscribeForm compact />
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} TechRadar.uz — {t("rights")}
      </div>
    </footer>
  );
}
