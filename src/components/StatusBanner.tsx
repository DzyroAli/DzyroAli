import { Info, TriangleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getBackendStatus } from "@/lib/backend-status";

/**
 * Explains the two states where the site can't show real data: demo mode (no
 * Supabase configured) and a configured-but-unreachable database. Without the
 * second case the app just looks broken — empty lists, actions that fail.
 */
export async function StatusBanner() {
  const status = await getBackendStatus();
  if (status === "ok") return null;

  const t = await getTranslations("common");

  if (status === "demo") {
    return (
      <div className="flex items-center justify-center gap-2 bg-brand-soft px-4 py-2 text-center text-xs font-medium text-brand-ink">
        <Info size={14} className="shrink-0" aria-hidden />
        {t("demoNotice")}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 bg-critical-soft px-4 py-2 text-center text-xs font-medium text-critical"
    >
      <TriangleAlert size={14} className="shrink-0" aria-hidden />
      {t("backendUnreachable")}
    </div>
  );
}
