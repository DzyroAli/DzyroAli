"use client";

import { Check, Link2, Send, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

const chip =
  "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations("product");
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copied = state === "copied";

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  /** execCommand fallback: the async clipboard API needs a secure context. */
  function legacyCopy(text: string): boolean {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }

  async function copyLink() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = legacyCopy(url);
    }
    // Always report the outcome — silently doing nothing reads as a dead button.
    setState(ok ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), ok ? 2000 : 4000);
  }

  const targets = [
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[13px] font-medium text-ink-muted">{t("share")}:</span>
      <button
        type="button"
        onClick={copyLink}
        className={cn(
          chip,
          copied && "border-positive text-positive",
          state === "failed" && "border-critical text-critical"
        )}
      >
        {copied && (
          <>
            <Check size={14} aria-hidden />
            {t("copied")}
          </>
        )}
        {state === "failed" && (
          <>
            <TriangleAlert size={14} aria-hidden />
            {t("copyFailed")}
          </>
        )}
        {state === "idle" && (
          <>
            <Link2 size={14} aria-hidden />
            {t("copyLink")}
          </>
        )}
      </button>
      <span role="status" className="sr-only">
        {copied ? t("copied") : state === "failed" ? t("copyFailed") : ""}
      </span>
      {targets.map((target) => (
        <a
          key={target.key}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(chip)}
        >
          <Send size={14} aria-hidden />
          {target.label}
        </a>
      ))}
    </div>
  );
}
