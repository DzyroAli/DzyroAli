import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps<T extends ElementType> = {
  as?: T;
  /** Required: icon-only controls have no visible text. */
  label: string;
  variant?: "outline" | "ghost";
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function IconButton<T extends ElementType = "button">({
  as,
  label,
  variant = "outline",
  className,
  children,
  ...rest
}: IconButtonProps<T>) {
  const Component = (as ?? "button") as ElementType;

  return (
    <Component
      {...(Component === "button" ? { type: "button" } : {})}
      {...rest}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "outline"
          ? "border border-line bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink"
          : "text-ink-muted hover:bg-surface-muted hover:text-ink",
        className
      )}
    >
      {children}
    </Component>
  );
}
