"use client";

import { ChevronUp } from "lucide-react";
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
}: {
  productId: string;
  initialVotes: number;
  initialVoted?: boolean;
  size?: "md" | "lg";
}) {
  const t = useTranslations("errors");
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

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={voted}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border font-semibold transition-all",
          size === "lg" ? "h-16 w-16 text-base" : "h-12 w-12 text-sm",
          voted
            ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/30"
            : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-600 hover:shadow-sm",
          pending && "opacity-60"
        )}
      >
        <ChevronUp size={size === "lg" ? 20 : 16} strokeWidth={3} />
        <span className="leading-none">{votes}</span>
      </button>
      {message && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
