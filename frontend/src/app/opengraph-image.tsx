import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TechRadar.uz — the launchpad for Uzbekistan's startups";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 84,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "linear-gradient(135deg, #14b8a6, #0891b2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
            }}
          >
            📡
          </div>
          <div style={{ display: "flex" }}>
            TechRadar
            <span style={{ color: "#2dd4bf" }}>.uz</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            color: "#94a3b8",
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
