"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Canvas, FabricObject, Textbox } from "fabric";
import {
  MAX_SLIDES,
  SLIDE_FORMATS,
  createSlide,
  uid,
  type Project,
  type Slide,
  type TextElement,
} from "@/lib/types";
import { getProject, saveProject } from "@/lib/storage";
import {
  loadSlide,
  readSlide,
  applyBackground,
  elementToObject,
  newTextElement,
  newStickerElement,
  cssFontFamily,
  modelFontFamily,
} from "@/lib/fabric-io";
import { exportProjectAsZip } from "@/lib/export";
import { useTelegram } from "@/components/TelegramProvider";
import { TextPanel, type TextProps } from "./TextPanel";
import { BackgroundPanel } from "./BackgroundPanel";
import { StickerPanel } from "./StickerPanel";
import { SlideStrip } from "./SlideStrip";

// Touch-friendly selection handles for the whole editor.
Object.assign(FabricObject.ownDefaults, {
  cornerStyle: "circle",
  transparentCorners: false,
  cornerColor: "#2481cc",
  cornerStrokeColor: "#ffffff",
  borderColor: "#2481cc",
  cornerSize: 14,
  touchCornerSize: 28,
  padding: 4,
});

type PanelKind = "text" | "background" | "sticker" | null;

const DEFAULT_TEXT_PROPS: TextProps = {
  fontFamily: "Inter",
  fontSize: 72,
  fontWeight: "bold",
  fill: "#111111",
  textAlign: "center",
};

export default function Editor({ projectId }: { projectId: string }) {
  const t = useTranslations("editor");
  const tc = useTranslations("common");
  const router = useRouter();
  const { webApp, haptic } = useTelegram();

  const [project, setProject] = useState<Project | null | "notfound">(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [panel, setPanel] = useState<PanelKind>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [textSelected, setTextSelected] = useState(false);
  const [textProps, setTextProps] = useState<TextProps>(DEFAULT_TEXT_PROPS);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [exporting, setExporting] = useState<{ done: number; total: number } | null>(null);
  const [stageWidth, setStageWidth] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const projectRef = useRef<Project | null>(null);
  const activeIndexRef = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadToken = useRef(0);

  // ── project loading ──
  useEffect(() => {
    getProject(projectId).then((p) => {
      if (!p) {
        setProject("notfound");
        return;
      }
      projectRef.current = p;
      setProject(p);
    });
  }, [projectId]);

  // ── stage measurement ──
  useEffect(() => {
    const measure = () => {
      if (stageRef.current) setStageWidth(Math.min(stageRef.current.clientWidth, 480));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [project]);

  const commitActiveSlide = useCallback(() => {
    const canvas = canvasRef.current;
    const p = projectRef.current;
    if (!canvas || !p) return;
    const i = activeIndexRef.current;
    const updated = readSlide(canvas, p.slides[i]);
    const next: Project = { ...p, slides: p.slides.map((s, idx) => (idx === i ? updated : s)) };
    projectRef.current = next;
    setProject(next);
  }, []);

  const persist = useCallback(async () => {
    commitActiveSlide();
    const p = projectRef.current;
    if (!p) return;
    setSaveState("saving");
    await saveProject(p);
    setSaveState("saved");
  }, [commitActiveSlide]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(persist, 1200);
  }, [persist]);

  // ── canvas lifecycle ──
  useEffect(() => {
    if (!project || project === "notfound" || !canvasElRef.current || stageWidth === 0) return;
    if (canvasRef.current) return; // already created

    const { width: W, height: H } = SLIDE_FORMATS[project.format];
    const cw = stageWidth;
    const ch = (cw * H) / W;

    const canvas = new Canvas(canvasElRef.current, {
      width: cw,
      height: ch,
      preserveObjectStacking: true,
      selection: false,
    });
    canvas.setZoom(cw / W);
    canvasRef.current = canvas;

    const syncSelection = () => {
      const obj = canvas.getActiveObject();
      setHasSelection(!!obj);
      const isText = obj instanceof Textbox;
      setTextSelected(isText);
      if (isText) {
        setTextProps({
          fontFamily: modelFontFamily(obj.fontFamily),
          fontSize: obj.fontSize ?? 72,
          fontWeight: obj.fontWeight === "bold" ? "bold" : "normal",
          fill: typeof obj.fill === "string" ? obj.fill : "#111111",
          textAlign: (obj.textAlign as TextProps["textAlign"]) ?? "center",
        });
        setPanel("text");
      }
    };

    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", () => {
      setHasSelection(false);
      setTextSelected(false);
    });
    canvas.on("object:modified", scheduleSave);
    canvas.on("text:changed", scheduleSave);

    loadSlide(canvas, project.slides[activeIndexRef.current], project.format);

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project === null || project === "notfound", stageWidth]);

  // ── Telegram back button ──
  useEffect(() => {
    if (!webApp) return;
    const goBack = () => router.push("/");
    try {
      webApp.BackButton.show();
      webApp.BackButton.onClick(goBack);
      return () => {
        webApp.BackButton.offClick(goBack);
        webApp.BackButton.hide();
      };
    } catch {
      return;
    }
  }, [webApp, router]);

  // flush pending save when leaving
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        persist();
      }
    };
  }, [persist]);

  const switchSlide = useCallback(
    async (index: number) => {
      const canvas = canvasRef.current;
      const p = projectRef.current;
      if (!canvas || !p || index === activeIndexRef.current) return;
      haptic("light");
      commitActiveSlide();
      activeIndexRef.current = index;
      setActiveIndex(index);
      const token = ++loadToken.current;
      const latest = projectRef.current!;
      await loadSlide(canvas, latest.slides[index], latest.format);
      if (token !== loadToken.current) return;
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      scheduleSave();
    },
    [commitActiveSlide, haptic, scheduleSave]
  );

  const mutateSlides = useCallback(
    (fn: (slides: Slide[]) => { slides: Slide[]; nextIndex: number }) => {
      const p = projectRef.current;
      if (!p) return;
      commitActiveSlide();
      const latest = projectRef.current!;
      const { slides, nextIndex } = fn(latest.slides);
      const next = { ...latest, slides };
      projectRef.current = next;
      setProject(next);
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      const canvas = canvasRef.current;
      if (canvas) {
        const token = ++loadToken.current;
        loadSlide(canvas, slides[nextIndex], next.format).then(() => {
          if (token === loadToken.current) canvas.requestRenderAll();
        });
      }
      scheduleSave();
    },
    [commitActiveSlide, scheduleSave]
  );

  const addSlide = useCallback(() => {
    const p = projectRef.current;
    if (!p || p.slides.length >= MAX_SLIDES) return;
    haptic("medium");
    mutateSlides((slides) => {
      const bg = structuredClone(slides[activeIndexRef.current].background);
      return { slides: [...slides, createSlide(bg)], nextIndex: slides.length };
    });
  }, [haptic, mutateSlides]);

  const duplicateSlide = useCallback(() => {
    const p = projectRef.current;
    if (!p || p.slides.length >= MAX_SLIDES) return;
    haptic("medium");
    mutateSlides((slides) => {
      const i = activeIndexRef.current;
      const copy: Slide = {
        ...structuredClone(slides[i]),
        id: uid(),
        elements: slides[i].elements.map((e) => ({ ...structuredClone(e), id: uid() })),
      };
      const next = [...slides.slice(0, i + 1), copy, ...slides.slice(i + 1)];
      return { slides: next, nextIndex: i + 1 };
    });
  }, [haptic, mutateSlides]);

  const deleteSlide = useCallback(() => {
    const p = projectRef.current;
    if (!p) return;
    if (p.slides.length <= 1) {
      alert(t("minSlides"));
      return;
    }
    haptic("medium");
    mutateSlides((slides) => {
      const i = activeIndexRef.current;
      const next = slides.filter((_, idx) => idx !== i);
      return { slides: next, nextIndex: Math.min(i, next.length - 1) };
    });
  }, [haptic, mutateSlides, t]);

  // ── element actions ──
  const addText = useCallback(() => {
    const canvas = canvasRef.current;
    const p = projectRef.current;
    if (!canvas || !p) return;
    haptic("light");
    const obj = elementToObject(newTextElement(p.format, t("defaultText")));
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    scheduleSave();
  }, [haptic, scheduleSave, t]);

  const addSticker = useCallback(
    (emoji: string) => {
      const canvas = canvasRef.current;
      const p = projectRef.current;
      if (!canvas || !p) return;
      haptic("light");
      const obj = elementToObject(newStickerElement(p.format, emoji));
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      scheduleSave();
    },
    [haptic, scheduleSave]
  );

  const updateText = useCallback(
    (props: Partial<TextProps>) => {
      const canvas = canvasRef.current;
      const obj = canvas?.getActiveObject();
      if (!canvas || !(obj instanceof Textbox)) return;
      const applied = props.fontFamily
        ? { ...props, fontFamily: cssFontFamily(props.fontFamily) }
        : props;
      obj.set(applied);
      canvas.requestRenderAll();
      setTextProps((prev) => ({ ...prev, ...props }));
      scheduleSave();
    },
    [scheduleSave]
  );

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    haptic("medium");
    canvas.getActiveObjects().forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    scheduleSave();
  }, [haptic, scheduleSave]);

  const setBackground = useCallback(
    async (bg: Slide["background"]) => {
      const canvas = canvasRef.current;
      const p = projectRef.current;
      if (!canvas || !p) return;
      haptic("light");
      const i = activeIndexRef.current;
      const next: Project = {
        ...p,
        slides: p.slides.map((s, idx) => (idx === i ? { ...s, background: bg } : s)),
      };
      projectRef.current = next;
      setProject(next);
      await applyBackground(canvas, bg, next.format);
      canvas.requestRenderAll();
      scheduleSave();
    },
    [haptic, scheduleSave]
  );

  const handleExport = useCallback(async () => {
    const p = projectRef.current;
    if (!p || exporting) return;
    haptic("medium");
    commitActiveSlide();
    setExporting({ done: 0, total: p.slides.length });
    try {
      await exportProjectAsZip(projectRef.current!, (done, total) => setExporting({ done, total }));
      haptic("success");
    } catch {
      haptic("error");
      alert(tc("error"));
    } finally {
      setExporting(null);
    }
  }, [commitActiveSlide, exporting, haptic, tc]);

  const renameProject = useCallback(
    (title: string) => {
      const p = projectRef.current;
      if (!p) return;
      const next = { ...p, title };
      projectRef.current = next;
      setProject(next);
      scheduleSave();
    },
    [scheduleSave]
  );

  // ── render ──
  if (project === "notfound") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold">{t("notFound")}</p>
        <button onClick={() => router.push("/")} className="rounded-xl bg-tg-button px-5 py-2.5 text-tg-button-text">
          {tc("back")}
        </button>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-tg-hint">
        {tc("loading")}
      </div>
    );
  }

  const { width: W, height: H } = SLIDE_FORMATS[project.format];
  const stageHeight = stageWidth ? (stageWidth * H) / W : 0;

  return (
    <div className="flex min-h-screen flex-col">
      {/* top bar */}
      <header className="flex items-center gap-2 px-3 py-2">
        <button onClick={() => router.push("/")} aria-label={tc("back")} className="p-2 text-xl leading-none">
          ←
        </button>
        <input
          value={project.title}
          onChange={(e) => renameProject(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-tg-hint"
        />
        <span className="text-xs text-tg-hint">
          {saveState === "saving" ? t("saving") : saveState === "saved" ? t("saved") : ""}
        </span>
        <button
          onClick={handleExport}
          disabled={!!exporting}
          className="rounded-xl bg-tg-button px-3 py-2 text-sm font-semibold text-tg-button-text disabled:opacity-60"
        >
          {exporting ? t("exporting", exporting) : `⬇ ${t("export")}`}
        </button>
      </header>

      {/* canvas stage */}
      <div ref={stageRef} className="flex flex-1 items-start justify-center overflow-hidden px-3">
        <div
          className="relative overflow-hidden rounded-lg shadow-lg"
          style={{ width: stageWidth || "100%", height: stageHeight || "auto" }}
        >
          <canvas ref={canvasElRef} />
        </div>
      </div>
      <p className="px-4 py-1 text-center text-[11px] text-tg-hint">{t("editHint")}</p>

      {/* active panel */}
      {panel === "text" && (
        <TextPanel
          textSelected={textSelected}
          props={textProps}
          onAdd={addText}
          onChange={updateText}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "background" && (
        <BackgroundPanel onApply={setBackground} onClose={() => setPanel(null)} />
      )}
      {panel === "sticker" && <StickerPanel onPick={addSticker} onClose={() => setPanel(null)} />}

      {/* toolbar */}
      <div className="flex items-center gap-2 px-3 py-2">
        {(
          [
            ["text", `🅣 ${t("text")}`],
            ["background", `🎨 ${t("background")}`],
            ["sticker", `😀 ${t("stickers")}`],
          ] as const
        ).map(([kind, label]) => (
          <button
            key={kind}
            onClick={() => {
              haptic("light");
              setPanel((prev) => (prev === kind ? null : kind));
            }}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium ${
              panel === kind ? "bg-tg-button text-tg-button-text" : "bg-tg-bg-secondary"
            }`}
          >
            {label}
          </button>
        ))}
        {hasSelection && (
          <button
            onClick={deleteSelected}
            aria-label={t("deleteElement")}
            className="rounded-xl bg-red-500/10 px-3 py-2.5 text-sm text-red-500"
          >
            🗑
          </button>
        )}
      </div>

      {/* slide strip */}
      <SlideStrip
        project={project}
        activeIndex={activeIndex}
        onSelect={switchSlide}
        onAdd={addSlide}
        onDuplicate={duplicateSlide}
        onDelete={deleteSlide}
      />
    </div>
  );
}
