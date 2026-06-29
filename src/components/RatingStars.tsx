"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { rateProduct } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useAuthModal } from "./auth/AuthModalContext";

export function RatingStars({
  productId,
  initialAvg,
  initialCount,
  initialUserRating,
}: {
  productId: string;
  initialAvg: number;
  initialCount: number;
  initialUserRating: number | null;
}) {
  const t = useTranslations("product");
  const tErr = useTranslations("errors");
  const { openAuthModal } = useAuthModal();
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [userRating, setUserRating] = useState(initialUserRating);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function rate(value: number) {
    if (pending) return;
    startTransition(async () => {
      const result = await rateProduct(productId, value);
      if (result.error === "loginRequired") {
        openAuthModal();
        return;
      }
      if (result.error) {
        setMessage(tErr(result.error === "demoMode" ? "demoMode" : "generic"));
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      setUserRating(result.rating ?? value);
      setAvg(result.ratingAvg ?? avg);
      setCount(result.ratingCount ?? count);
    });
  }

  // Звёзды подсвечиваются по наведению, иначе — по оценке пользователя или средней.
  const display = hover || userRating || Math.round(avg);

  return (
    <div className="relative inline-flex flex-col gap-1">
      <div className="flex items-center gap-2.5">
        <div role="radiogroup" className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={userRating === star}
              aria-label={String(star)}
              disabled={pending}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => rate(star)}
              className="p-0.5 transition-transform hover:scale-110 disabled:opacity-60"
            >
              <Star
                size={22}
                className={cn(
                  star <= display
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 dark:text-slate-600"
                )}
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {count > 0 ? (
            <>
              <strong className="text-slate-900 dark:text-slate-100">
                {avg.toFixed(1)}
              </strong>{" "}
              · {count} {t("ratings")}
            </>
          ) : (
            t("ratingNone")
          )}
        </span>
      </div>
      {userRating ? (
        <span className="text-xs text-slate-400">
          {t("yourRating")}: {userRating}/5
        </span>
      ) : (
        <span className="text-xs text-slate-400">{t("rateHint")}</span>
      )}
      {message && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
