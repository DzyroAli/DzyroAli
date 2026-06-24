"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Suggestion {
  slug: string;
  name: string;
  tagline: string;
}

/** Нечёткое совпадение: все буквы запроса встречаются по порядку. */
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return 100 - t.indexOf(q);
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 50 - t.length / 10 : -1;
}

/**
 * Поиск в шапке: подсказки на лету + глобальная горячая клавиша ⌘K / Ctrl+K,
 * мгновенно фокусирующая поле.
 */
export function HeaderSearch({
  action,
  placeholder,
  hotkey = false,
}: {
  action: string;
  placeholder: string;
  hotkey?: boolean;
}) {
  const t = useTranslations("common");
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  // Закрытие подсказок по клику мимо
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Подсказки с дебаунсом + клиентская нечёткая пересортировка
  useEffect(() => {
    const q = query.trim();
    const timer = setTimeout(async () => {
      if (q.length < 2) {
        setItems([]);
        setOpen(false);
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { items: Suggestion[] };
        const ranked = data.items
          .map((item) => ({
            item,
            score: Math.max(
              fuzzyScore(q, item.name),
              fuzzyScore(q, item.tagline) - 5
            ),
          }))
          .filter((r) => r.score >= 0)
          .sort((a, b) => b.score - a.score)
          .map((r) => r.item);
        setItems(ranked);
        setOpen(true);
      } catch {
        setItems([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={boxRef} className="relative w-full">
      <form action={action} className="relative w-full">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 bg-slate-100/70 py-2 pl-9 pr-14 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:bg-white"
        />
        {hotkey && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 lg:block">
            ⌘K
          </kbd>
        )}
      </form>

      {open && items.length > 0 && (
        <div className="anim-fade-in absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              onClick={() => setOpen(false)}
              className="block px-3.5 py-2 transition-colors hover:bg-slate-50"
            >
              <span className="block truncate text-sm font-semibold text-slate-900">
                {item.name}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {item.tagline}
              </span>
            </Link>
          ))}
          <Link
            href={`/products?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-3.5 py-2 text-xs font-semibold text-teal-700 hover:bg-slate-50"
          >
            {t("searchAll")} «{query}» →
          </Link>
        </div>
      )}
    </div>
  );
}
