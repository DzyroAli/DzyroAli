import { getLocale } from "next-intl/server";
import { getNewest } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://techradar.uz";

export async function GET() {
  const locale = await getLocale();
  const products = await getNewest(50);

  const siteUrl = locale === "uz" ? SITE_URL : `${SITE_URL}/${locale}`;

  const feedItems = products
    .map(
      (p) => `
  <item>
    <title>${escapeXml(p.name)}</title>
    <description>${escapeXml(p.tagline)}</description>
    <link>${siteUrl}/products/${p.slug}</link>
    <guid>${SITE_URL}/products/${p.slug}</guid>
    <pubDate>${new Date(p.launched_at).toUTCString()}</pubDate>
    ${
      p.logo_url
        ? `<enclosure url="${escapeXml(p.logo_url)}" type="image/png" />`
        : ""
    }
  </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${locale === "uz" ? "TechRadar.uz - Yangi mahsulotlar" : locale === "ru" ? "TechRadar.uz - Новые продукты" : "TechRadar.uz - New Products"}</title>
    <link>${siteUrl}</link>
    <description>${locale === "uz" ? "O'zbekiston startup ekotizimidagi yangi mahsulotlar" : locale === "ru" ? "Новые продукты экосистемы стартапов Узбекистана" : "New products from Uzbekistan's startup ecosystem"}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    ${feedItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
