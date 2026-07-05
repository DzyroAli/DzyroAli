// ── Slide document model ────────────────────────────────────────────────
// This is the persistent format stored in Supabase / localStorage.
// It is deliberately independent from Fabric.js serialization so that
// upgrading Fabric never breaks saved projects.

export const SLIDE_FORMATS = {
  "1080x1080": { width: 1080, height: 1080 },
  "1080x1350": { width: 1080, height: 1350 },
} as const;

export type SlideFormat = keyof typeof SLIDE_FORMATS;

export interface ColorBackground {
  type: "color";
  color: string;
}

export interface GradientBackground {
  type: "gradient";
  from: string;
  to: string;
  /** degrees, 0 = left→right, 90 = top→bottom */
  angle: number;
}

export interface ImageBackground {
  type: "image";
  /** data URL or https URL */
  src: string;
}

export type SlideBackground = ColorBackground | GradientBackground | ImageBackground;

interface BaseElement {
  id: string;
  x: number;
  y: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontFamily: "Inter" | "Montserrat";
  fontSize: number;
  fontWeight: "normal" | "bold";
  fill: string;
  textAlign: "left" | "center" | "right";
  width: number;
  lineHeight: number;
}

export interface StickerElement extends BaseElement {
  type: "sticker";
  emoji: string;
  fontSize: number;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shape: "rect" | "circle";
  width: number;
  height: number;
  fill: string;
  rx: number;
}

export type SlideElement = TextElement | StickerElement | ShapeElement;

export interface Slide {
  id: string;
  background: SlideBackground;
  elements: SlideElement[];
}

export interface Project {
  id: string;
  title: string;
  format: SlideFormat;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

export interface TgUser {
  id: number;
  firstName: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
}

export const MAX_SLIDES = 10;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function createSlide(background: SlideBackground = { type: "color", color: "#ffffff" }): Slide {
  return { id: uid(), background, elements: [] };
}

export function createProject(title: string, format: SlideFormat, slides?: Slide[]): Project {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title,
    format,
    slides: slides && slides.length > 0 ? slides : [createSlide()],
    createdAt: now,
    updatedAt: now,
  };
}
