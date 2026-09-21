import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UzbekistanMap } from "@/components/map/UzbekistanMap";
import { PageBody } from "@/components/shell/AppShell";
import { getAllUsers, getProducts } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  return { title: t("title"), description: t("subtitle") };
}

/** Where products are being built: cities projected from real coordinates. */
export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const t = await getTranslations("map");
  const [{ products }, makers] = await Promise.all([
    getProducts({ sort: "top", perPage: 200 }),
    getAllUsers(200),
  ]);

  return (
    <PageBody>
      <header className="mb-5">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-ink-muted sm:text-[15px]">{t("subtitle")}</p>
      </header>

      <UzbekistanMap
        initialCity={city}
        products={products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          votes: p.votes_count,
          city: p.maker?.city ?? null,
        }))}
        makers={makers.map((m) => ({
          id: m.id,
          username: m.username,
          name: m.full_name ?? m.username,
          avatarUrl: m.avatar_url,
          city: m.city ?? null,
        }))}
      />
    </PageBody>
  );
}
