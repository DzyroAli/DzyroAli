"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { updateProfileCity } from "@/lib/actions";
import { CITIES, cityName } from "@/lib/cities";
import { Select } from "./ui/Field";

/**
 * Sets the maker's city — the only place this value is entered, and what the
 * ecosystem map is built from.
 */
export function CityPicker({ initialCity }: { initialCity: string | null }) {
  const t = useTranslations("settings");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const [city, setCity] = useState(initialCity ?? "");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const previous = city;
    setCity(next);
    setStatus("idle");
    startTransition(async () => {
      const result = await updateProfileCity(next || null);
      if (result.error) {
        setCity(previous);
        setStatus("error");
        setMessage(
          tErr(result.error === "demoMode" ? "demoMode" : "generic")
        );
        return;
      }
      setStatus("saved");
      setMessage(null);
    });
  }

  const sorted = [...CITIES].sort((a, b) =>
    cityName(a, locale).localeCompare(cityName(b, locale))
  );

  return (
    <div className="space-y-1.5">
      <Select
        id="city"
        value={city}
        disabled={pending}
        aria-invalid={status === "error" || undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t("cityNone")}</option>
        {sorted.map((c) => (
          <option key={c.slug} value={c.slug}>
            {cityName(c, locale)}
          </option>
        ))}
      </Select>
      <p
        role={status === "error" ? "alert" : "status"}
        className={
          status === "error" ? "text-xs text-critical" : "text-xs text-ink-muted"
        }
      >
        {status === "error" && message
          ? message
          : status === "saved" && !pending
            ? t("citySaved")
            : t("cityHint")}
      </p>
    </div>
  );
}
