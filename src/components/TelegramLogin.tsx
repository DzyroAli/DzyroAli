"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

/** Renders the official Telegram Login Widget. */
export function TelegramLogin({ botUsername }: { botUsername: string }) {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-request-access", "write");
    script.setAttribute(
      "data-auth-url",
      `${window.location.origin}/api/auth/telegram?locale=${locale}`
    );
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [botUsername, locale]);

  return <div ref={containerRef} className="flex min-h-12 justify-center" />;
}
