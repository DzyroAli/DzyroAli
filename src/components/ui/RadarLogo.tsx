import { cn } from "@/lib/utils";

interface RadarLogoProps {
  size?: number;
  /** Slow sweep rotation. Disabled automatically under prefers-reduced-motion. */
  animated?: boolean;
  className?: string;
}

/**
 * The brand mark: a circular radar silhouette — three rings, a centre point and
 * a short sweep arm. Drawn with currentColor so it inherits the surrounding
 * text colour, and legible down to 16px.
 */
export function RadarLogo({ size = 28, animated = false, className }: RadarLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <circle cx="16" cy="16" r="14.25" stroke="currentColor" strokeWidth="1.5" opacity="0.28" />
      <circle cx="16" cy="16" r="9.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="16" r="4.75" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
      <g className={animated ? "anim-sweep" : undefined} style={{ transformOrigin: "16px 16px" }}>
        <path
          d="M16 16 L25.7 6.3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      <circle cx="16" cy="16" r="2.6" fill="currentColor" />
    </svg>
  );
}

/** Radar mark + wordmark, used in the top bar and the footer. */
export function RadarWordmark({
  size = 28,
  className,
  markClassName,
}: {
  size?: number;
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <RadarLogo size={size} className={cn("text-brand", markClassName)} />
      <span className="text-[17px] font-semibold tracking-tight text-ink">YaRato</span>
    </span>
  );
}
