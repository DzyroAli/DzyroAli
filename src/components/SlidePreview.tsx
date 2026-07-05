import { SLIDE_FORMATS, type Slide, type SlideFormat } from "@/lib/types";

// Lightweight CSS approximation of a slide — used for project cards and the
// template gallery so we don't boot Fabric.js outside the editor.

function backgroundStyle(slide: Slide): React.CSSProperties {
  const bg = slide.background;
  if (bg.type === "color") return { backgroundColor: bg.color };
  if (bg.type === "gradient") {
    return { backgroundImage: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` };
  }
  return { backgroundImage: `url(${bg.src})`, backgroundSize: "cover", backgroundPosition: "center" };
}

export function SlidePreview({
  slide,
  format,
  width,
  className = "",
}: {
  slide: Slide;
  format: SlideFormat;
  width: number;
  className?: string;
}) {
  const { width: W, height: H } = SLIDE_FORMATS[format];
  const scale = width / W;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height: H * scale, ...backgroundStyle(slide) }}
    >
      <div
        style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}
        className="pointer-events-none absolute left-0 top-0"
      >
        {slide.elements.map((el) => {
          const common: React.CSSProperties = {
            position: "absolute",
            left: el.x,
            top: el.y,
            opacity: el.opacity,
            transform: `rotate(${el.angle}deg) scale(${el.scaleX}, ${el.scaleY})`,
            transformOrigin: "top left",
          };
          if (el.type === "text") {
            return (
              <div
                key={el.id}
                style={{
                  ...common,
                  width: el.width,
                  color: el.fill,
                  fontSize: el.fontSize,
                  fontWeight: el.fontWeight,
                  textAlign: el.textAlign,
                  lineHeight: el.lineHeight,
                  fontFamily:
                    el.fontFamily === "Montserrat" ? "var(--font-montserrat)" : "var(--font-inter)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {el.text}
              </div>
            );
          }
          if (el.type === "sticker") {
            return (
              <div key={el.id} style={{ ...common, fontSize: el.fontSize, lineHeight: 1 }}>
                {el.emoji}
              </div>
            );
          }
          return (
            <div
              key={el.id}
              style={{
                ...common,
                width: el.width,
                height: el.height,
                backgroundColor: el.fill,
                borderRadius: el.shape === "circle" ? "50%" : el.rx,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
