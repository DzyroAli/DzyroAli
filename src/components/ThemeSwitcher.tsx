"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { IconButton } from "./ui/IconButton";

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = useTranslations("common");

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const html = document.documentElement;
    html.classList.toggle("dark", next === "dark");
    html.style.colorScheme = next;
    localStorage.setItem("theme", next);
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <IconButton
      onClick={toggle}
      label={theme === "dark" ? t("themeLight") : t("themeDark")}
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </IconButton>
  );
}
