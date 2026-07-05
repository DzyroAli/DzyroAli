"use client";

import { SLIDE_FORMATS, type Project } from "./types";

/**
 * Renders every slide at full resolution and downloads a ZIP of PNGs.
 * Heavy deps (fabric, jszip) are imported lazily — they only load when
 * the user actually exports.
 */
export async function exportProjectAsZip(
  project: Project,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const [{ StaticCanvas }, { loadSlide }, JSZip] = await Promise.all([
    import("fabric"),
    import("./fabric-io"),
    import("jszip").then((m) => m.default),
  ]);

  // Make sure Inter/Montserrat are loaded before drawing at full resolution.
  await document.fonts.ready;

  const { width, height } = SLIDE_FORMATS[project.format];
  const zip = new JSZip();
  const canvas = new StaticCanvas(undefined, { width, height, renderOnAddRemove: false });

  try {
    for (let i = 0; i < project.slides.length; i++) {
      await loadSlide(canvas, project.slides[i], project.format);
      canvas.renderAll();
      const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
      zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, dataUrl.split(",")[1], { base64: true });
      onProgress?.(i + 1, project.slides.length);
    }
  } finally {
    canvas.dispose();
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const name = `${project.title.replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 40) || "carousel"}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
