"use client";

import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toggleBookmark } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useAuthModal } from "./auth/AuthModalContext";

export function BookmarkButton({
  productId,
  initialBookmarked = false,
}: {
  productId: string;
  initialBookmarked?: boolean;
}) {
  const t = useTranslations("product");
  const tErr = useTranslations("errors");
  const { openAuthModal } = useAuthModal();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (pending) return;
    startTransition(async () => {
      const result = await toggleBookmark(productId);
      if (result.error === "loginRequired") {
        // Неавторизованный клик перехватываем модалкой входа.
        openAuthModal();
        return;
      }
      if (result.error) {
        setMessage(tErr(result.error === "demoMode" ? "demoMode" : "generic"));
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      setBookmarked(result.bookmarked ?? !bookmarked);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={bookmarked}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors",
          bookmarked
            ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
          pending && "opacity-60"
        )}
      >
        <Bookmark size={15} className={bookmarked ? "fill-current" : ""} />
        {bookmarked ? t("bookmarked") : t("bookmark")}
      </button>
      {message && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
