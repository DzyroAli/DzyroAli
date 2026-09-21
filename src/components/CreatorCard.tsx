import { MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cityLabel } from "@/lib/cities";
import type { Profile } from "@/lib/types";
import { Avatar } from "./ui/Avatar";

/** Maker card for the community index and other people listings. */
export async function CreatorCard({
  profile,
  products,
  votes,
}: {
  profile: Profile;
  products: number;
  votes: number;
}) {
  const locale = await getLocale();
  const t = await getTranslations("maker");
  const city = cityLabel(profile.city, locale);
  const displayName = profile.full_name ?? profile.username;

  return (
    <Link
      href={`/makers/${profile.username}`}
      className="flex h-full flex-col rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong"
    >
      <div className="flex items-center gap-3">
        <Avatar
          name={displayName}
          username={profile.username}
          src={profile.avatar_url}
          size={44}
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-ink">{displayName}</p>
          <p className="truncate text-sm text-ink-muted">@{profile.username}</p>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-3 line-clamp-2 text-sm leading-snug text-ink-muted">
          {profile.bio}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        {city && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} aria-hidden />
            {city}
          </span>
        )}
        <span className="tabular-nums">
          {products} {t("statProducts")}
        </span>
        <span className="tabular-nums">
          {votes} {t("statVotes")}
        </span>
      </div>
    </Link>
  );
}
