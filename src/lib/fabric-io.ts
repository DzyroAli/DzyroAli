"use client";

// Model ⇄ Fabric.js conversion. Client-only (Fabric touches `document`).
// All coordinates live in full-resolution space (1080×1080 / 1080×1350);
// the editor scales the view with canvas zoom.

import {
  Canvas,
  StaticCanvas,
  Textbox,
  FabricText,
  FabricImage,
  Rect,
  Circle,
  Gradient,
  type FabricObject,
} from "fabric";
import {
  SLIDE_FORMATS,
  uid,
  type Slide,
  type SlideBackground,
  type SlideElement,
  type SlideFormat,
  type TextElement,
  type StickerElement,
  type ShapeElement,
} from "./types";

type AnyCanvas = Canvas | StaticCanvas;

interface ElementMeta {
  elementId: string;
  elementType: SlideElement["type"];
}

// next/font registers fonts under hashed family names ("__Inter_abc123"),
// so Fabric must draw with the resolved name from the CSS variables set in
// the root layout — otherwise the canvas falls back to serif.
export function cssFontFamily(name: TextElement["fontFamily"]): string {
  if (typeof document === "undefined") return name;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name === "Montserrat" ? "--font-montserrat" : "--font-inter")
    .trim();
  return v || name;
}

export function modelFontFamily(cssName: string | undefined): TextElement["fontFamily"] {
  return /montserrat/i.test(cssName ?? "") ? "Montserrat" : "Inter";
}

function gradientAngleCoords(angle: number, w: number, h: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = Math.max(w, h);
  return {
    x1: cx - (Math.cos(rad) * len) / 2,
    y1: cy - (Math.sin(rad) * len) / 2,
    x2: cx + (Math.cos(rad) * len) / 2,
    y2: cy + (Math.sin(rad) * len) / 2,
  };
}

export async function applyBackground(canvas: AnyCanvas, bg: SlideBackground, format: SlideFormat) {
  const { width, height } = SLIDE_FORMATS[format];
  canvas.backgroundImage = undefined;
  if (bg.type === "color") {
    canvas.backgroundColor = bg.color;
  } else if (bg.type === "gradient") {
    canvas.backgroundColor = new Gradient({
      type: "linear",
      coords: gradientAngleCoords(bg.angle, width, height),
      colorStops: [
        { offset: 0, color: bg.from },
        { offset: 1, color: bg.to },
      ],
    });
  } else {
    canvas.backgroundColor = "#111111";
    const img = await FabricImage.fromURL(bg.src, { crossOrigin: "anonymous" });
    const scale = Math.max(width / img.width!, height / img.height!);
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: (width - img.width! * scale) / 2,
      top: (height - img.height! * scale) / 2,
      selectable: false,
      evented: false,
    });
    canvas.backgroundImage = img;
  }
}

function meta(obj: FabricObject): ElementMeta | undefined {
  return (obj as FabricObject & { slaydchi?: ElementMeta }).slaydchi;
}

function setMeta(obj: FabricObject, m: ElementMeta) {
  (obj as FabricObject & { slaydchi?: ElementMeta }).slaydchi = m;
}

export function elementToObject(el: SlideElement): FabricObject {
  const common = {
    left: el.x,
    top: el.y,
    angle: el.angle,
    scaleX: el.scaleX,
    scaleY: el.scaleY,
    opacity: el.opacity,
  };

  let obj: FabricObject;
  if (el.type === "text") {
    obj = new Textbox(el.text, {
      ...common,
      width: el.width,
      fontFamily: cssFontFamily(el.fontFamily),
      fontSize: el.fontSize,
      fontWeight: el.fontWeight,
      fill: el.fill,
      textAlign: el.textAlign,
      lineHeight: el.lineHeight,
    });
  } else if (el.type === "sticker") {
    obj = new FabricText(el.emoji, { ...common, fontSize: el.fontSize });
  } else if (el.shape === "circle") {
    obj = new Circle({ ...common, radius: el.width / 2, fill: el.fill });
  } else {
    obj = new Rect({ ...common, width: el.width, height: el.height, fill: el.fill, rx: el.rx, ry: el.rx });
  }
  setMeta(obj, { elementId: el.id, elementType: el.type });
  return obj;
}

export function objectToElement(obj: FabricObject): SlideElement | null {
  const m = meta(obj);
  if (!m) return null;
  const base = {
    id: m.elementId,
    x: obj.left ?? 0,
    y: obj.top ?? 0,
    angle: obj.angle ?? 0,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    opacity: obj.opacity ?? 1,
  };

  if (m.elementType === "text") {
    const t = obj as Textbox;
    const el: TextElement = {
      ...base,
      type: "text",
      text: t.text ?? "",
      fontFamily: modelFontFamily(t.fontFamily),
      fontSize: t.fontSize ?? 64,
      fontWeight: t.fontWeight === "bold" || Number(t.fontWeight) >= 600 ? "bold" : "normal",
      fill: typeof t.fill === "string" ? t.fill : "#000000",
      textAlign: (t.textAlign as TextElement["textAlign"]) ?? "left",
      width: t.width ?? 400,
      lineHeight: t.lineHeight ?? 1.16,
    };
    return el;
  }
  if (m.elementType === "sticker") {
    const t = obj as FabricText;
    const el: StickerElement = { ...base, type: "sticker", emoji: t.text ?? "⭐", fontSize: t.fontSize ?? 160 };
    return el;
  }
  const isCircle = obj instanceof Circle;
  const el: ShapeElement = {
    ...base,
    type: "shape",
    shape: isCircle ? "circle" : "rect",
    width: isCircle ? (obj as Circle).radius! * 2 : ((obj as Rect).width ?? 100),
    height: isCircle ? (obj as Circle).radius! * 2 : ((obj as Rect).height ?? 100),
    fill: typeof obj.fill === "string" ? obj.fill : "#000000",
    rx: (obj as Rect).rx ?? 0,
  };
  return el;
}

export async function loadSlide(canvas: AnyCanvas, slide: Slide, format: SlideFormat) {
  canvas.remove(...canvas.getObjects());
  await applyBackground(canvas, slide.background, format);
  for (const el of slide.elements) {
    canvas.add(elementToObject(el));
  }
  canvas.requestRenderAll();
}

/** Reads current canvas objects back into the slide (mutates a copy). */
export function readSlide(canvas: AnyCanvas, slide: Slide): Slide {
  const elements = canvas
    .getObjects()
    .map(objectToElement)
    .filter((e): e is SlideElement => e !== null);
  return { ...slide, elements };
}

export function newTextElement(format: SlideFormat, text: string): TextElement {
  const { width, height } = SLIDE_FORMATS[format];
  return {
    id: uid(),
    type: "text",
    text,
    x: width * 0.1,
    y: height * 0.4,
    width: width * 0.8,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    fontFamily: "Inter",
    fontSize: 72,
    fontWeight: "bold",
    fill: "#111111",
    textAlign: "center",
    lineHeight: 1.16,
  };
}

export function newStickerElement(format: SlideFormat, emoji: string): StickerElement {
  const { width, height } = SLIDE_FORMATS[format];
  return {
    id: uid(),
    type: "sticker",
    emoji,
    x: width / 2 - 90,
    y: height / 2 - 90,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    fontSize: 180,
  };
}
