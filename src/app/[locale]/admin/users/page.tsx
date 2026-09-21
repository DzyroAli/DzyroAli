import { Check } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { UserAdminActions } from "@/components/admin/UserAdminActions";
import { getAllUsers, getCurrentUser } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";

/** Список пользователей платформы. */
export default async function AdminUsersPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const [users, { userId: meId }] = await Promise.all([
    getAllUsers(),
    getCurrentUser(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">{t("navUsers")}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {t("usersSubtitle", { count: users.length })}
      </p>

      <div className="mt-5 overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-semibold">{t("colUser")}</th>
              <th className="px-4 py-3 font-semibold">{t("colRole")}</th>
              <th className="px-4 py-3 font-semibold">{t("colDigest")}</th>
              <th className="px-4 py-3 font-semibold">{t("colRegistered")}</th>
              <th className="px-4 py-3 font-semibold">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line">
                <td className="px-4 py-3">
                  <Link
                    href={`/makers/${u.username}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar
                      name={u.full_name ?? u.username}
                      username={u.username}
                      src={u.avatar_url}
                      size={36}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">
                        {u.full_name ?? u.username}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        @{u.username}
                        {u.telegram_username ? ` · tg: @${u.telegram_username}` : ""}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={
                        u.role === "admin"
                          ? "rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold uppercase text-brand-ink"
                          : "rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-ink-muted"
                      }
                    >
                      {u.role}
                    </span>
                    {u.banned && (
                      <span className="rounded-full bg-critical-soft px-2.5 py-0.5 text-xs font-semibold uppercase text-critical">
                        {t("bannedBadge")}
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {u.digest_opt_in ? (
                    <Check size={15} className="text-positive" aria-label="yes" />
                  ) : (
                    <span className="text-ink-subtle">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                  {formatDate(u.created_at, locale)}
                </td>
                <td className="px-4 py-3">
                  <UserAdminActions
                    userId={u.id}
                    role={u.role}
                    banned={Boolean(u.banned)}
                    isSelf={u.id === meId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
