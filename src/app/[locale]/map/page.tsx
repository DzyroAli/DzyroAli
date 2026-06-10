import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EcosystemMap } from "@/components/EcosystemMap";
import { getAllUsers, getProducts } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  return { title: t("title") };
}

/** Карта экосистемы: радар продуктов и людей с режимами «Карта»/«Список». */
export default async function MapPage() {
  const [{ products }, makers] = await Promise.all([
    getProducts({ sort: "top", perPage: 100 }),
    getAllUsers(100),
  ]);

  return (
    <EcosystemMap
      products={products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        votes: p.votes_count,
        categorySlug: p.category?.slug ?? "other",
      }))}
      makers={makers.map((m) => ({
        id: m.id,
        username: m.username,
        name: m.full_name ?? m.username,
        role: m.role,
      }))}
    />
  );
}
