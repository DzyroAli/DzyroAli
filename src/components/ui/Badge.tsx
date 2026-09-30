import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "positive" | "critical";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface text-ink-muted",
  brand: "border-transparent bg-brand-soft text-brand-ink",
  positive: "border-transparent bg-positive-soft text-positive",
  critical: "border-transparent bg-critical-soft text-critical",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  /** Rendered as-is; pass an already-sized icon element. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
