import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/ProductCard";
import { PageBody } from "@/components/shell/AppShell";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "@/i18n/navigation";
import {
  getBookmarkedProducts,
  getCurrentUser,
  getVotedProductIds,
} from "@/lib/data";
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
  const voted = await getVotedProductIds(products.map((p) => p.id));

  return (
    <PageBody>
      <header>
        <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">{t("subtitle")}</p>
      </header>

      <div className="mt-6">
        {needsLogin ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-ink">{t("loginRequired")}</p>
            <Link href="/login" className={buttonClass("primary", "md", "mt-5")}>
              {tc("login")}
            </Link>
          </Card>
        ) : products.length === 0 ? (
          <EmptyState
            title={t("empty")}
            action={
              <Link href="/products" className={buttonClass("secondary")}>
                {t("browse")}
              </Link>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} voted={voted.has(p.id)} />
            ))}
          </div>
        )}
      </div>
    </PageBody>
  );
}
