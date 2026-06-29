"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = (stored as "light" | "dark" | null) || (prefersDark ? "dark" : "light");

    setTheme(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(newTheme: "light" | "dark") {
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  }

  function toggle() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);
  }

  if (theme === null) return null;

  return (
    <button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} />
      )}
    </button>
  );
}
