import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("anim-shimmer rounded-lg bg-surface-muted", className)}
    />
  );
}

/** Placeholder matching the product card layout, for route-level loading UI. */
export function ProductCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-card border border-line bg-surface p-4">
      <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-14 w-12 shrink-0 rounded-xl" />
    </div>
  );
}
