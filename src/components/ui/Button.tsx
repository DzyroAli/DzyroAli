import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-hover",
  secondary:
    "border border-line bg-surface text-ink hover:bg-surface-muted active:bg-surface-muted",
  ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink active:bg-surface-muted",
  danger:
    "border border-critical/30 bg-critical-soft text-critical hover:border-critical/50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
) {
  return cn(base, variants[variant], sizes[size], className);
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? "button") as ElementType;
  const isNativeButton = Component === "button";

  return (
    <Component
      {...(isNativeButton ? { type: "button" } : {})}
      {...rest}
      {...(loading ? { "aria-busy": true, disabled: true } : {})}
      className={buttonClass(variant, size, className)}
    >
      {loading ? <Spinner /> : null}
      {children}
    </Component>
  );
}
