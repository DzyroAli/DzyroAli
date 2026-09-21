"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { subscribe, type SubscribeState } from "@/lib/actions";
import { Button } from "./ui/Button";
import { FormMessage, Input } from "./ui/Field";

export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("footer");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<SubscribeState, FormData>(
    subscribe,
    {}
  );

  if (state.ok) {
    return <FormMessage tone="success">{t("subscribeSuccess")}</FormMessage>;
  }

  return (
    <form action={formAction} className="space-y-2">
      <div className={compact ? "flex flex-col gap-2" : "flex gap-2"}>
        <Input
          type="email"
          name="email"
          required
          placeholder={t("subscribePlaceholder")}
          aria-invalid={state.error ? true : undefined}
          className="min-w-0 flex-1 py-2"
        />
        <input type="hidden" name="locale" value={locale} />
        <Button type="submit" loading={pending} className="shrink-0">
          {t("subscribeButton")}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="text-xs text-critical">
          {state.error === "demoMode" ? tErr("demoMode") : t("subscribeError")}
        </p>
      )}
    </form>
  );
}
