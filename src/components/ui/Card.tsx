import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Base surface: white, hairline border, soft radius, no heavy shadow. */
export function Card({
  children,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Component className={cn("rounded-card border border-line bg-surface", className)}>
      {children}
    </Component>
  );
}

export function SectionHeading({
  title,
  meta,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-baseline justify-between gap-3", className)}>
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {meta ? <span className="shrink-0 text-[13px] text-ink-muted">{meta}</span> : null}
    </div>
  );
}
