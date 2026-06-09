"use client";

import { Check, X } from "lucide-react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { setProductStatus } from "@/lib/actions";

export function ModerationButtons({ productId }: { productId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const act = (status: "approved" | "rejected") =>
    startTransition(async () => {
      await setProductStatus(productId, status);
      router.refresh();
    });

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => act("approved")}
        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Check size={14} strokeWidth={3} />
        {t("approve")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => act("rejected")}
        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
      >
        <X size={14} strokeWidth={3} />
        {t("reject")}
      </button>
    </div>
  );
}
