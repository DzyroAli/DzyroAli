import {
  Inbox,
  Mail,
  MessageSquare,
  Package,
  ShieldAlert,
  ThumbsUp,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ModerationButtons } from "@/components/ModerationButtons";
import { ProductLogo } from "@/components/ProductLogo";
import {
  getCurrentUser,
  getPendingProducts,
  getRecentUsers,
  getStats,
} from "@/lib/data";
import { categoryName } from "@/lib/types";
import { formatDate, gradientFor, initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const { profile } = await getCurrentUser();

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto mb-4 text-rose-500" size={40} />
        <p className="font-medium text-slate-700">{t("accessDenied")}</p>
      </div>
    );
  }

  const [stats, pending, users] = await Promise.all([
    getStats(),
    getPendingProducts(),
    getRecentUsers(),
  ]);

  const cards = [
    { label: t("totalProducts"), value: stats.totalProducts, icon: Package },
    { label: t("pendingProducts"), value: stats.pendingProducts, icon: Inbox },
    { label: t("totalUsers"), value: stats.totalUsers, icon: Users },
    { label: t("totalVotes"), value: stats.totalVotes, icon: ThumbsUp },
    { label: t("totalComments"), value: stats.totalComments, icon: MessageSquare },
    { label: t("subscribers"), value: stats.subscribers, icon: Mail },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <c.icon size={18} className="text-teal-600" />
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {c.value}
            </p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-lg font-bold text-slate-900">
        {t("moderationQueue")}
      </h2>
      {pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          {t("emptyQueue")}
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <ProductLogo name={p.name} logoUrl={p.logo_url} size={48} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${p.slug}`}
                  className="font-semibold text-slate-900 hover:text-teal-700"
                >
                  {p.name}
                </Link>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {p.tagline}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {p.category ? categoryName(p.category, locale) : "—"}
                  {p.maker ? ` · @${p.maker.username}` : ""} ·{" "}
                  {formatDate(p.created_at, locale)}
                </p>
              </div>
              <ModerationButtons productId={p.id} />
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-4 mt-10 text-lg font-bold text-slate-900">
        {t("recentUsers")}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Link
            key={u.id}
            href={`/makers/${u.username}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-md"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${gradientFor(u.username)}`}
            >
              {initials(u.full_name ?? u.username)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {u.full_name ?? u.username}
                {u.role === "admin" && (
                  <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700">
                    admin
                  </span>
                )}
              </span>
              <span className="block truncate text-xs text-slate-500">
                @{u.username} · {formatDate(u.created_at, locale)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
