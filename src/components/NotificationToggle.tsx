"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateCommentNotifications } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function NotificationToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const t = useTranslations("settings");
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next); // оптимистично
    startTransition(async () => {
      const res = await updateCommentNotifications(next);
      if (res.error) setEnabled(!next); // откат при ошибке
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {t("commentNotifications")}
        </p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {t("commentNotificationsDesc")}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={t("commentNotifications")}
        disabled={pending}
        onClick={toggle}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60",
          enabled ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-600"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
