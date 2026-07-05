"use client";

import { useTranslations } from "next-intl";

const EMOJIS = [
  "🔥", "💰", "🎉", "✅", "⭐", "❤️", "👍", "🚀",
  "🎁", "📣", "💡", "📚", "⚡", "🏆", "😍", "🤝",
  "📈", "💎", "☕", "🕌", "🇺🇿", "🌙", "🍇", "🏔",
  "👇", "➡️", "❗", "💬", "🛍", "⏰", "📍", "📞",
];

export function StickerPanel({ onPick, onClose }: { onPick: (emoji: string) => void; onClose: () => void }) {
  const t = useTranslations("editor");

  return (
    <div className="border-t border-black/5 bg-tg-bg-secondary px-3 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-tg-hint">{t("stickers")}</span>
        <button onClick={onClose} className="p-1 text-tg-hint">✕</button>
      </div>
      <div className="mt-2 grid max-h-40 grid-cols-8 gap-1 overflow-y-auto">
        {EMOJIS.map((e) => (
          <button key={e} onClick={() => onPick(e)} className="rounded-lg py-1.5 text-2xl active:bg-tg-bg">
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
