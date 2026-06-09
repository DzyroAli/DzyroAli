import { Calendar, Globe, Send } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/ProductCard";
import { getMaker } from "@/lib/data";
import { formatDate, gradientFor, initials } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const maker = await getMaker(username);
  if (!maker) return {};
  return {
    title: maker.profile.full_name ?? maker.profile.username,
    description: maker.profile.bio ?? undefined,
  };
}

export default async function MakerPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const maker = await getMaker(username);
  if (!maker) notFound();

  const { profile, products } = maker;
  const t = await getTranslations("maker");
  const locale = await getLocale();
  const displayName = profile.full_name ?? profile.username;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <span
          className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white ${gradientFor(profile.username)}`}
        >
          {initials(displayName)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
          <p className="text-sm text-slate-500">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {profile.bio}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-teal-700 hover:underline"
              >
                <Globe size={14} />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {profile.telegram_username && (
              <a
                href={`https://t.me/${profile.telegram_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-600 hover:underline"
              >
                <Send size={14} />@{profile.telegram_username}
              </a>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} />
              {t("joined")}: {formatDate(profile.created_at, locale)}
            </span>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-10 text-lg font-bold text-slate-900">
        {t("products")}{" "}
        <span className="font-normal text-slate-400">({products.length})</span>
      </h2>
      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {t("noProducts")}
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
