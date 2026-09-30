import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const t = await getTranslations("common");

  const href = (p: number) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) search.set(k, v);
    }
    if (p > 1) search.set("page", String(p));
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkClass = (disabled: boolean) =>
    cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink-muted transition-colors",
      disabled
        ? "pointer-events-none opacity-40"
        : "hover:border-brand hover:text-brand"
    );

  return (
    <nav
      aria-label={t("pagination")}
      className="flex items-center justify-center gap-3 text-sm font-medium"
    >
      <Link
        href={href(page - 1)}
        className={linkClass(page <= 1)}
        aria-disabled={page <= 1}
        aria-label={t("previousPage")}
      >
        <ChevronLeft size={16} aria-hidden />
      </Link>
      <span className="tabular-nums text-ink-muted">
        {page} / {totalPages}
      </span>
      <Link
        href={href(page + 1)}
        className={linkClass(page >= totalPages)}
        aria-disabled={page >= totalPages}
        aria-label={t("nextPage")}
      >
        <ChevronRight size={16} aria-hidden />
      </Link>
    </nav>
  );
}
