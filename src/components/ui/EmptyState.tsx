import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RadarLogo } from "./RadarLogo";

/** Empty state carrying the radar motif — a quiet scan that found nothing. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <span className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
        <span className="anim-ping absolute inset-0 rounded-full bg-brand-soft" aria-hidden />
        <RadarLogo size={40} className="relative text-brand opacity-70" />
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
