"use client";

import { useTranslations } from "next-intl";
import { MAX_SLIDES, type Project } from "@/lib/types";
import { SlidePreview } from "@/components/SlidePreview";

export function SlideStrip({
  project,
  activeIndex,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
}: {
  project: Project;
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("editor");
  const canAdd = project.slides.length < MAX_SLIDES;

  return (
    <div className="border-t border-black/5 bg-tg-bg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-xs text-tg-hint">
          {activeIndex + 1} / {project.slides.length}
        </span>
        <div className="flex gap-3 text-xs">
          <button onClick={onDuplicate} disabled={!canAdd} className="text-tg-link disabled:opacity-40">
            ⧉ {t("duplicateSlide")}
          </button>
          <button
            onClick={onDelete}
            disabled={project.slides.length <= 1}
            className="text-red-500 disabled:opacity-40"
          >
            🗑 {t("deleteSlide")}
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 py-2">
        {project.slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => onSelect(i)}
            className={`relative shrink-0 overflow-hidden rounded-lg border-2 ${
              i === activeIndex ? "border-tg-link" : "border-black/10"
            }`}
          >
            <SlidePreview slide={slide} format={project.format} width={52} />
            <span className="absolute bottom-0 right-0 rounded-tl bg-black/50 px-1 text-[10px] text-white">
              {i + 1}
            </span>
          </button>
        ))}
        {canAdd && (
          <button
            onClick={onAdd}
            aria-label={t("addSlide")}
            className="flex shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-tg-hint/40 text-xl text-tg-hint"
            style={{ width: 52, height: project.format === "1080x1080" ? 52 : 65 }}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
