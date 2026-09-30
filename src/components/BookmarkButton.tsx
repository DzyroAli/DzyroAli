"use client";

import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toggleBookmark } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useAuthModal } from "./auth/AuthModalContext";
import { buttonClass } from "./ui/Button";

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
          buttonClass("secondary"),
          bookmarked && "border-brand bg-brand-soft text-brand-ink",
          pending && "opacity-60"
        )}
      >
        <Bookmark
          size={15}
          aria-hidden
          className={bookmarked ? "fill-current" : ""}
        />
        {bookmarked ? t("bookmarked") : t("bookmark")}
      </button>
      {message && (
        <div
          role="status"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink shadow-lg"
        >
          {message}
        </div>
      )}
    </div>
  );
}
