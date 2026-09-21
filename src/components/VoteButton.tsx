"use client";

import { ArrowUp } from "lucide-react";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleVote } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useAuthModal } from "./auth/AuthModalContext";

export function VoteButton({
  productId,
  initialVotes,
  initialVoted = false,
  size = "md",
  tone = "default",
}: {
  productId: string;
  initialVotes: number;
  initialVoted?: boolean;
  size?: "md" | "lg";
  /** `onBrand` renders the inline pill used on the blue featured card. */
  tone?: "default" | "onBrand";
}) {
  const t = useTranslations("errors");
  const tp = useTranslations("product");
  const { openAuthModal } = useAuthModal();
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(initialVoted);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (pending) return;
    startTransition(async () => {
      const result = await toggleVote(productId);
      if (result.error === "loginRequired") {
        // Неавторизованный клик перехватываем модалкой входа.
        openAuthModal();
        return;
      }
      if (result.error) {
        setMessage(t(result.error === "demoMode" ? "demoMode" : "generic"));
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      setVotes(result.votes ?? votes);
      setVoted(result.voted ?? !voted);
    });
  }

  if (tone === "onBrand") {
    return (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          aria-pressed={voted}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:cursor-progress",
            voted
              ? "border-transparent bg-on-brand text-brand"
              : "border-on-brand/40 text-on-brand hover:bg-on-brand/10",
            pending && "opacity-60"
          )}
        >
          <ArrowUp size={16} strokeWidth={2.5} aria-hidden />
          {tp("upvote")}
          <span aria-hidden className="opacity-60">
            ·
          </span>
          <span className="tabular-nums">{votes}</span>
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

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={voted}
        aria-label={`${tp("upvote")} — ${votes}`}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 rounded-xl border font-semibold transition-colors disabled:cursor-progress",
          // min-w rather than a fixed width so four-digit counts still fit.
          size === "lg"
            ? "h-16 min-w-16 px-2 text-base"
            : "h-[52px] min-w-12 px-2 text-[13px]",
          voted
            ? "border-brand bg-brand text-on-brand hover:bg-brand-hover"
            : "border-line bg-surface text-ink hover:border-brand hover:text-brand",
          pending && "opacity-60"
        )}
      >
        <ArrowUp size={size === "lg" ? 20 : 15} strokeWidth={2.5} aria-hidden />
        <span className="leading-none tabular-nums">{votes}</span>
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
