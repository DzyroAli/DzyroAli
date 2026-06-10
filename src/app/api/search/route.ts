import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Лёгкий JSON-эндпоинт для подсказок в строке поиска. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ items: [] });

  const { products } = await getProducts({ q, perPage: 8 });
  return NextResponse.json({
    items: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      logo: p.logo_url,
    })),
  });
}
