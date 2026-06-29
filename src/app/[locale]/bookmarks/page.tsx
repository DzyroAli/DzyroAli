import { Bookmark } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getBookmarkedProducts, getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bookmarks" });
  return { title: t("title") };
}

export default async function BookmarksPage() {
  const t = await getTranslations("bookmarks");
  const tc = await getTranslations("common");
  const { userId } = await getCurrentUser();
  const needsLogin = isSupabaseConfigured() && !userId;

  const products = needsLogin ? [] : await getBookmarkedProducts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-2.5">
        <Bookmark size={24} className="text-amber-500" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("title")}
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t("subtitle")}
      </p>

      <div className="mt-8">
        {needsLogin ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-slate-700 dark:text-slate-200">
              {t("loginRequired")}
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white"
            >
              {tc("login")}
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">{t("empty")}</p>
            <Link
              href="/products"
              className="mt-5 inline-block rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {t("browse")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
