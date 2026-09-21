"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { updateCommentNotifications } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { focusRing } from "./ui/Button";

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
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">
          {t("commentNotifications")}
        </p>
        <p className="mt-0.5 text-sm text-ink-muted">
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
          focusRing,
          enabled ? "bg-brand" : "bg-line-strong"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform",
            enabled ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
