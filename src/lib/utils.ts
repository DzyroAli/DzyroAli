export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya", қ: "q",
  ў: "o", ғ: "g", ҳ: "h",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/['ʼ’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "product";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function formatDate(iso: string, locale: string): string {
  const map: Record<string, string> = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" };
  return new Date(iso).toLocaleDateString(map[locale] ?? "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function timeAgo(iso: string, locale: string): string {
  const map: Record<string, string> = { uz: "uz", ru: "ru", en: "en" };
  const rtf = new Intl.RelativeTimeFormat(map[locale] ?? "en", {
    numeric: "auto",
  });
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) {
      return rtf.format(Math.round(diff / secs), unit);
    }
  }
  return rtf.format(Math.round(diff), "second");
}

/** Deterministic gradient for letter avatars, keyed by name. */
export function gradientFor(seed: string): string {
  const gradients = [
    "from-teal-500 to-cyan-500",
    "from-violet-500 to-purple-500",
    "from-amber-500 to-orange-500",
    "from-sky-500 to-blue-600",
    "from-rose-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-indigo-500 to-violet-500",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return gradients[hash % gradients.length];
}
