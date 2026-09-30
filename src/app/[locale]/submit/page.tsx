import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SubmitForm } from "@/components/SubmitForm";
import { PageBody } from "@/components/shell/AppShell";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("submitTitle") };
}

export default async function SubmitPage() {
  const t = await getTranslations("submit");
  const tc = await getTranslations("common");
  const { userId } = await getCurrentUser();
  const needsLogin = isSupabaseConfigured() && !userId;

  return (
    <PageBody className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
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
        ) : (
          <SubmitForm />
        )}
      </div>
    </PageBody>
  );
}
