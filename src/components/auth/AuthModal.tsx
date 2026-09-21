"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AuthPanel } from "./AuthPanel";
import { RadarLogo } from "../ui/RadarLogo";

/** Модальное окно «Вход в аккаунт» с плавным появлением. */
export function AuthModal({
  onClose,
  telegramBot,
}: {
  onClose: () => void;
  telegramBot?: string;
}) {
  const t = useTranslations("login");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="anim-fade-in fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-overlay p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      <div
        className="anim-scale-in relative my-8 w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-4 top-4 rounded-lg p-1 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-muted"
        >
          <X size={18} />
        </button>

        <div className="mb-5 text-center">
          <RadarLogo size={36} className="mx-auto mb-3 text-brand" />
          <h2 className="text-lg font-semibold text-ink">{t("title")}</h2>
          <p className="mt-1 text-xs text-ink-muted">{t("subtitle")}</p>
        </div>

        <AuthPanel telegramBot={telegramBot} onSuccess={onClose} />
      </div>
    </div>
  );
}
