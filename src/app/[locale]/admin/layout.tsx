import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/data";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Каркас админки: серверная проверка роли (RLS прикрывает данные,
 * этот guard — UI) + сайдбар-навигация по разделам.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");
  const { userId, profile } = await getCurrentUser();

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto mb-4 text-rose-500" size={40} />
        <p className="font-medium text-slate-700">{t("accessDenied")}</p>
        {!userId && (
          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white"
          >
            {tc("login")}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-8">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
