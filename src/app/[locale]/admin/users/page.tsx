import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { UserAdminActions } from "@/components/admin/UserAdminActions";
import { getAllUsers, getCurrentUser } from "@/lib/data";
import { formatDate, gradientFor, initials } from "@/lib/utils";

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
      <h1 className="text-2xl font-bold text-slate-900">{t("navUsers")}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t("usersSubtitle", { count: users.length })}
      </p>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-semibold">{t("colUser")}</th>
              <th className="px-4 py-3 font-semibold">{t("colRole")}</th>
              <th className="px-4 py-3 font-semibold">{t("colDigest")}</th>
              <th className="px-4 py-3 font-semibold">{t("colRegistered")}</th>
              <th className="px-4 py-3 font-semibold">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/makers/${u.username}`}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${gradientFor(u.username)}`}
                    >
                      {initials(u.full_name ?? u.username)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-900">
                        {u.full_name ?? u.username}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
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
                          ? "rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold uppercase text-violet-700"
                          : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500"
                      }
                    >
                      {u.role}
                    </span>
                    {u.banned && (
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold uppercase text-rose-600">
                        {t("bannedBadge")}
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u.digest_opt_in ? "✅" : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
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
