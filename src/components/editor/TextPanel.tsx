"use client";

import { useTranslations } from "next-intl";

export interface TextProps {
  fontFamily: "Inter" | "Montserrat";
  fontSize: number;
  fontWeight: "normal" | "bold";
  fill: string;
  textAlign: "left" | "center" | "right";
}

const COLORS = ["#ffffff", "#111111", "#ef4444", "#f59e0b", "#facc15", "#22c55e", "#0ea5e9", "#8b5cf6"];

export function TextPanel({
  textSelected,
  props,
  onAdd,
  onChange,
  onClose,
}: {
  textSelected: boolean;
  props: TextProps;
  onAdd: () => void;
  onChange: (p: Partial<TextProps>) => void;
  onClose: () => void;
}) {
  const t = useTranslations("editor");

  return (
    <div className="border-t border-black/5 bg-tg-bg-secondary px-3 py-3">
      <div className="flex items-center justify-between">
        <button onClick={onAdd} className="rounded-xl bg-tg-button px-4 py-2 text-sm font-semibold text-tg-button-text">
          + {t("addText")}
        </button>
        <button onClick={onClose} className="p-1 text-tg-hint">✕</button>
      </div>

      {textSelected && (
        <div className="mt-3 space-y-3">
          {/* font + bold + align */}
          <div className="flex items-center gap-2">
            {(["Inter", "Montserrat"] as const).map((f) => (
              <button
                key={f}
                onClick={() => onChange({ fontFamily: f })}
                style={{ fontFamily: f === "Inter" ? "var(--font-inter)" : "var(--font-montserrat)" }}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  props.fontFamily === f ? "bg-tg-button text-tg-button-text" : "bg-tg-bg"
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => onChange({ fontWeight: props.fontWeight === "bold" ? "normal" : "bold" })}
              aria-label={t("bold")}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                props.fontWeight === "bold" ? "bg-tg-button text-tg-button-text" : "bg-tg-bg"
              }`}
            >
              B
            </button>
            <div className="ml-auto flex gap-1">
              {(
                [
                  ["left", "⬅"],
                  ["center", "↔"],
                  ["right", "➡"],
                ] as const
              ).map(([align, icon]) => (
                <button
                  key={align}
                  onClick={() => onChange({ textAlign: align })}
                  aria-label={`${t("align")}: ${align}`}
                  className={`rounded-lg px-2 py-1.5 text-sm ${
                    props.textAlign === align ? "bg-tg-button text-tg-button-text" : "bg-tg-bg"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* size */}
          <label className="flex items-center gap-3 text-sm">
            <span className="w-16 shrink-0 text-tg-hint">{t("size")}</span>
            <input
              type="range"
              min={24}
              max={200}
              value={props.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="w-full accent-[var(--tg-button)]"
            />
            <span className="w-8 text-right text-tg-hint">{props.fontSize}</span>
          </label>

          {/* color */}
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-sm text-tg-hint">{t("color")}</span>
            <div className="flex flex-1 flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onChange({ fill: c })}
                  aria-label={c}
                  className={`h-7 w-7 rounded-full border-2 ${
                    props.fill === c ? "border-tg-link" : "border-black/10"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={props.fill}
                onChange={(e) => onChange({ fill: e.target.value })}
                className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
