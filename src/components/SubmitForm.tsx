"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { submitProduct, type SubmitState } from "@/lib/actions";
import { CATEGORIES } from "@/lib/categories";
import { categoryName } from "@/lib/types";
import { Button, buttonClass } from "./ui/Button";
import { Card } from "./ui/Card";
import { FormMessage, Input, Label, Select, Textarea } from "./ui/Field";

export function SubmitForm() {
  const t = useTranslations("submit");
  const tErr = useTranslations("errors");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(
    submitProduct,
    {}
  );

  if (state.ok) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-positive" size={36} aria-hidden />
        <p className="text-sm font-medium text-ink">{t("success")}</p>
        <Link href="/" className={buttonClass("primary", "md", "mt-5")}>
          {tc("goHome")}
        </Link>
      </Card>
    );
  }

  const errorText =
    state.error === "demoMode"
      ? tErr("demoMode")
      : state.error === "loginRequired"
        ? tErr("loginRequired")
        : state.error === "banned"
          ? tErr("banned")
          : tErr("generic");

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="name">{t("name")} *</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={60}
          placeholder={t("namePlaceholder")}
        />
      </div>

      <div>
        <Label htmlFor="tagline">{t("tagline")} *</Label>
        <Input
          id="tagline"
          name="tagline"
          required
          maxLength={140}
          placeholder={t("taglinePlaceholder")}
        />
      </div>

      <div>
        <Label htmlFor="category">{t("category")} *</Label>
        <Select id="category" name="category" required defaultValue="">
          <option value="" disabled />
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {categoryName(c, locale)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          maxLength={5000}
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="website">{t("website")}</Label>
          <Input id="website" name="website" type="url" placeholder="https://" />
        </div>
        <div>
          <Label htmlFor="telegram">{t("telegram")}</Label>
          <Input
            id="telegram"
            name="telegram"
            type="url"
            placeholder="https://t.me/"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="logo">{t("logo")}</Label>
        <Input id="logo" name="logo" type="url" placeholder="https://" />
        <p className="mt-1 text-xs text-ink-muted">{t("logoHint")}</p>
      </div>

      {state.error && <FormMessage tone="error">{errorText}</FormMessage>}

      <div className="flex flex-col items-start gap-3">
        <Button type="submit" size="lg" loading={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
        <p className="text-xs text-ink-muted">{t("moderationNote")}</p>
      </div>
    </form>
  );
}
