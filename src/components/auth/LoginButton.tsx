"use client";

import { useTranslations } from "next-intl";
import { Button } from "../ui/Button";
import { useAuthModal } from "./AuthModalContext";

/** Кнопка «Войти» в шапке — открывает модалку вместо перехода на страницу. */
export function LoginButton() {
  const t = useTranslations("common");
  const { openAuthModal } = useAuthModal();
  return (
    <Button variant="secondary" onClick={openAuthModal} className="px-3">
      {t("login")}
    </Button>
  );
}
