import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Pagination({
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
      "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors",
      disabled
        ? "pointer-events-none opacity-40"
        : "hover:border-teal-400 hover:text-teal-600"
    );

  return (
    <nav className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold">
      <Link href={href(page - 1)} className={linkClass(page <= 1)} aria-label="Previous">
        <ChevronLeft size={16} />
      </Link>
      <span className="text-slate-500">
        {page} / {totalPages}
      </span>
      <Link
        href={href(page + 1)}
        className={linkClass(page >= totalPages)}
        aria-label="Next"
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
