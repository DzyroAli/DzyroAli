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
    return <span className="text-xs text-ink-muted">{t("youLabel")}</span>;
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-muted disabled:opacity-50"
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
            ? "border-brand bg-brand-soft text-brand-ink hover:bg-brand-soft"
            : "border-critical/30 bg-critical-soft text-critical hover:bg-critical-soft"
        )}
      >
        {banned ? <RotateCcw size={13} /> : <Ban size={13} />}
        {banned ? t("unban") : t("ban")}
      </button>
    </div>
  );
}
