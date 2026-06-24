"use client";

import { Radar, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AuthPanel } from "./AuthPanel";

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
      className="anim-fade-in fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      <div
        className="anim-scale-in relative my-8 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>

        <div className="mb-5 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
            <Radar size={22} />
          </span>
          <h2 className="text-lg font-bold text-slate-900">{t("title")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("subtitle")}</p>
        </div>

        <AuthPanel telegramBot={telegramBot} onSuccess={onClose} />
      </div>
    </div>
  );
}
