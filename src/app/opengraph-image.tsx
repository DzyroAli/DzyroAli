import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "YaRato — the launchpad for Uzbekistan's startups";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RADAR_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="120" height="120">
  <g fill="none" stroke="#4D93F0" stroke-width="1.5" stroke-linecap="round">
    <circle cx="16" cy="16" r="14.25" opacity="0.35"/>
    <circle cx="16" cy="16" r="9.5" opacity="0.6"/>
    <circle cx="16" cy="16" r="4.75" opacity="0.85"/>
    <path d="M16 16 L25.7 6.3" stroke-width="2.2"/>
  </g>
  <circle cx="16" cy="16" r="2.8" fill="#4D93F0"/>
</svg>`;

export default function OgImage() {
  const mark = `data:image/svg+xml;base64,${btoa(RADAR_MARK)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1220",
          color: "#E7ECF3",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={120} height={120} alt="" />
          <div style={{ display: "flex" }}>YaRato</div>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#93A1B5",
            display: "flex",
          }}
        >
          O&apos;zbekiston startaplari maydonchasi · Площадка стартапов
          Узбекистана
        </div>
      </div>
    ),
    size
  );
}
