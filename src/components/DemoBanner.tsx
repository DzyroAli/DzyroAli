import { Info } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function DemoBanner() {
  if (isSupabaseConfigured()) return null;
  const t = await getTranslations("common");
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-800">
      <Info size={14} className="shrink-0" />
      {t("demoNotice")}
    </div>
  );
}
