import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getAllApprovedSlugs } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://techradar.uz";

function localized(path: string): MetadataRoute.Sitemap[number]["alternates"] {
  return {
    languages: {
      uz: `${SITE_URL}${path}`,
      ru: `${SITE_URL}/ru${path}`,
      en: `${SITE_URL}/en${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  const staticPaths = [
    "",
    "/products",
    "/submit",
    "/login",
    "/about",
    "/leaderboard",
    "/map",
    "/launch-guide",
    "/privacy",
    "/terms",
  ];
  for (const path of staticPaths) {
    entries.push({
      url: `${SITE_URL}${path || "/"}`,
      changeFrequency: "daily",
      priority: path === "" ? 1 : 0.7,
      alternates: localized(path),
    });
  }

  for (const category of CATEGORIES) {
    const path = `/category/${category.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: localized(path),
    });
  }

  const products = await getAllApprovedSlugs();
  for (const product of products) {
    const path = `/products/${product.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(product.updated),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: localized(path),
    });
  }

  return entries;
}
