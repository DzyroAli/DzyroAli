"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { rateProduct } from "@/lib/actions";
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
              className="rounded p-0.5 transition-transform hover:scale-110 disabled:opacity-60"
            >
              <Star
                size={22}
                aria-hidden
                className={
                  star <= display
                    ? "fill-brand text-brand"
                    : "text-line-strong"
                }
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-ink-muted">
          {count > 0 ? (
            <>
              <strong className="text-ink">
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
        <span className="text-xs text-ink-muted">
          {t("yourRating")}: {userRating}/5
        </span>
      ) : (
        <span className="text-xs text-ink-muted">{t("rateHint")}</span>
      )}
      {message && (
        <div
          role="status"
          className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink shadow-lg"
        >
          {message}
        </div>
      )}
    </div>
  );
}
