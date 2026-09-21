"use client";

import { Check, Link2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "./ui/Button";

const chip =
  "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations("product");
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Буфер обмена недоступен (не-HTTPS / отказ в доступе) — тихо игнорируем
    }
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
        className={cn(chip, focusRing, copied && "border-positive text-positive")}
      >
        {copied ? (
          <>
            <Check size={14} aria-hidden />
            {t("copied")}
          </>
        ) : (
          <>
            <Link2 size={14} aria-hidden />
            {t("copyLink")}
          </>
        )}
      </button>
      {targets.map((target) => (
        <a
          key={target.key}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(chip, focusRing)}
        >
          <Send size={14} aria-hidden />
          {target.label}
        </a>
      ))}
    </div>
  );
}
