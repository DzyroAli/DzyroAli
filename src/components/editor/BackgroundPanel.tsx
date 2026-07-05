"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { SlideBackground } from "@/lib/types";
import { fileToDataUrl } from "@/lib/image";

const COLORS = [
  "#ffffff", "#f8fafc", "#fef3c7", "#facc15", "#111827", "#0c4a6e",
  "#0ea5e9", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899",
];

const GRADIENTS: Array<[string, string]> = [
  ["#0f2027", "#2c5364"],
  ["#cb2d3e", "#ef473a"],
  ["#f7971e", "#ffd200"],
  ["#7f00ff", "#e100ff"],
  ["#1a2980", "#26d0ce"],
  ["#42275a", "#734b6d"],
  ["#000428", "#004e92"],
  ["#134e5e", "#71b280"],
];

type Tab = "color" | "gradient" | "photo";

export function BackgroundPanel({
  onApply,
  onClose,
}: {
  onApply: (bg: SlideBackground) => void;
  onClose: () => void;
}) {
  const t = useTranslations("editor");
  const [tab, setTab] = useState<Tab>("color");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const src = await fileToDataUrl(file);
      onApply({ type: "image", src });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-black/5 bg-tg-bg-secondary px-3 py-3">
      <div className="flex items-center gap-2">
        {(
          [
            ["color", t("bgColor")],
            ["gradient", t("bgGradient")],
            ["photo", t("bgPhoto")],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === k ? "bg-tg-button text-tg-button-text" : "bg-tg-bg"
            }`}
          >
            {label}
          </button>
        ))}
        <button onClick={onClose} className="ml-auto p-1 text-tg-hint">✕</button>
      </div>

      {tab === "color" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onApply({ type: "color", color: c })}
              aria-label={c}
              className="h-10 w-10 rounded-xl border border-black/10"
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            onChange={(e) => onApply({ type: "color", color: e.target.value })}
            className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
            aria-label={t("bgColor")}
          />
        </div>
      )}

      {tab === "gradient" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {GRADIENTS.map(([from, to]) => (
            <button
              key={from + to}
              onClick={() => onApply({ type: "gradient", from, to, angle: 135 })}
              aria-label={`${from} → ${to}`}
              className="h-10 w-10 rounded-xl border border-black/10"
              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
            />
          ))}
        </div>
      )}

      {tab === "photo" && (
        <div className="mt-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="w-full rounded-xl bg-tg-button py-3 text-sm font-semibold text-tg-button-text disabled:opacity-60"
          >
            📷 {t("uploadPhoto")}
          </button>
          <p className="mt-2 text-center text-xs text-tg-hint">{t("photoHint")}</p>
        </div>
      )}
    </div>
  );
}
