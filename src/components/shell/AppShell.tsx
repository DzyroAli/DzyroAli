import type { ReactNode } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { MobileNav, SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

/**
 * Three-zone frame: compact left rail, main column, and an optional right rail
 * that each page composes inside its own content (see `PageWithRail`).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <TopBar />
      <MobileNav />
      {/* The rail sits flush against the viewport edge; only the reading
          column is width-constrained. */}
      <div className="flex flex-1 items-start">
        <SideNav />
        <main className="mx-auto w-full min-w-0 max-w-[1180px] flex-1">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

/**
 * Main column plus supporting rail. The rail drops below the content on
 * tablet and narrower, per the layout brief.
 */
export function PageWithRail({
  children,
  rail,
}: {
  children: ReactNode;
  rail?: ReactNode;
}) {
  return (
    <div className="grid gap-6 px-4 py-6 sm:py-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">{children}</div>
      {rail ? <aside className="min-w-0 space-y-5">{rail}</aside> : null}
    </div>
  );
}

/** Single-column page body with the same gutters and max width. */
export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "px-4 py-6 sm:py-8"}>{children}</div>
  );
}
