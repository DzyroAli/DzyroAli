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
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
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
          className="w-full rounded-xl border border-line bg-surface-muted py-2 pl-9 pr-14 text-sm text-ink transition-colors outline-none placeholder:text-ink-subtle hover:border-line-strong focus:border-brand focus:bg-surface focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand"
        />
        {hotkey && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-subtle lg:block">
            ⌘K
          </kbd>
        )}
      </form>

      {open && items.length > 0 && (
        <div className="anim-fade-in absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              onClick={() => setOpen(false)}
              className="block px-3.5 py-2 transition-colors hover:bg-surface-muted"
            >
              <span className="block truncate text-sm font-medium text-ink">
                {item.name}
              </span>
              <span className="block truncate text-xs text-ink-muted">
                {item.tagline}
              </span>
            </Link>
          ))}
          <Link
            href={`/products?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="block border-t border-line px-3.5 py-2 text-xs font-semibold text-brand-ink hover:bg-surface-muted"
          >
            {t("searchAll")} «{query}» →
          </Link>
        </div>
      )}
    </div>
  );
}
