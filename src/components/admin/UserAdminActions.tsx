"use client";

import { Ban, RotateCcw, Shield, ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setUserBanned, setUserRole } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function UserAdminActions({
  userId,
  role,
  banned,
  isSelf,
}: {
  userId: string;
  role: "user" | "admin";
  banned: boolean;
  isSelf: boolean;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isSelf) {
    return <span className="text-xs text-slate-400">{t("youLabel")}</span>;
  }

  const toggleRole = () =>
    startTransition(async () => {
      await setUserRole(userId, role === "admin" ? "user" : "admin");
      router.refresh();
    });

  const toggleBan = () =>
    startTransition(async () => {
      await setUserBanned(userId, !banned);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={toggleRole}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        {role === "admin" ? <ShieldOff size={13} /> : <Shield size={13} />}
        {role === "admin" ? t("demote") : t("promote")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={toggleBan}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
          banned
            ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
            : "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
        )}
      >
        {banned ? <RotateCcw size={13} /> : <Ban size={13} />}
        {banned ? t("unban") : t("ban")}
      </button>
    </div>
  );
}
