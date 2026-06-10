import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ModerationButtons } from "@/components/ModerationButtons";
import { ProductLogo } from "@/components/ProductLogo";
import { getAdminProducts } from "@/lib/data";
import { categoryName, type ProductStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const STATUSES = ["pending", "approved", "rejected"] as const;

const STATUS_BADGE: Record<ProductStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-teal-50 text-teal-700 border-teal-200",
  rejected: "bg-rose-50 text-rose-600 border-rose-200",
};

/** Полная таблица модерации всех заявок с фильтром по статусу. */
export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = STATUSES.includes(rawStatus as (typeof STATUSES)[number])
    ? (rawStatus as ProductStatus)
    : undefined;

  const t = await getTranslations("admin");
  const locale = await getLocale();
  const products = await getAdminProducts(status);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{t("navModeration")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("moderationSubtitle")}</p>

      <div className="mt-5 flex gap-2 text-sm font-semibold">
        <Link
          href="/admin/moderation"
          className={cn(
            "rounded-lg px-3 py-1.5 transition-colors",
            !status ? "bg-teal-100 text-teal-800" : "text-slate-500 hover:text-slate-900"
          )}
        >
          {t("statusAll")}
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/moderation?status=${s}`}
            className={cn(
              "rounded-lg px-3 py-1.5 transition-colors",
              status === s
                ? "bg-teal-100 text-teal-800"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {t(`status_${s}`)}
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">{t("colProduct")}</th>
              <th className="px-4 py-3 font-semibold">{t("colCategory")}</th>
              <th className="px-4 py-3 font-semibold">{t("colSubmittedBy")}</th>
              <th className="px-4 py-3 font-semibold">{t("colDate")}</th>
              <th className="px-4 py-3 font-semibold">{t("colStatus")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  {t("emptyQueue")}
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 align-middle">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    <ProductLogo name={p.name} logoUrl={p.logo_url} size={36} />
                    <span className="min-w-0">
                      <Link
                        href={`/products/${p.slug}`}
                        className="block truncate font-semibold text-slate-900 hover:text-teal-700"
                      >
                        {p.name}
                      </Link>
                      <span className="block max-w-56 truncate text-xs text-slate-500">
                        {p.tagline}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.category ? categoryName(p.category, locale) : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.maker ? (
                    <Link
                      href={`/makers/${p.maker.username}`}
                      className="text-teal-700 hover:underline"
                    >
                      @{p.maker.username}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {formatDate(p.created_at, locale)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      STATUS_BADGE[p.status]
                    )}
                    title={p.rejection_reason ?? undefined}
                  >
                    {t(`status_${p.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {/* Кнопки доступны для любого статуса: решение можно пересмотреть */}
                  <ModerationButtons productId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
