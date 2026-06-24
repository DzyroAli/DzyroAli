"use client";

import { useTranslations } from "next-intl";
import { useAuthModal } from "./AuthModalContext";

/** Кнопка «Войти» в шапке — открывает модалку вместо перехода на страницу. */
export function LoginButton() {
  const t = useTranslations("common");
  const { openAuthModal } = useAuthModal();
  return (
    <button
      type="button"
      onClick={openAuthModal}
      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      {t("login")}
    </button>
  );
}
