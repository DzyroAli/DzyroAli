import type { Category } from "./types";

/**
 * Static category catalog. Mirrors the `categories` table seed
 * (supabase/migrations) and backs demo mode. Slugs are stable identifiers.
 */
export const CATEGORIES: Category[] = [
  { id: 1, slug: "startups", name_uz: "Startaplar", name_ru: "Стартапы", name_en: "Startups", position: 1 },
  { id: 2, slug: "ai-assistants", name_uz: "AI-assistentlar", name_ru: "ИИ-ассистенты", name_en: "AI Assistants", position: 2 },
  { id: 3, slug: "telegram-bots", name_uz: "Telegram-botlar va Mini Apps", name_ru: "Телеграм-боты и Mini Apps", name_en: "Telegram Bots & Mini Apps", position: 3 },
  { id: 4, slug: "for-websites", name_uz: "Saytlar uchun", name_ru: "Для сайтов", name_en: "For Websites", position: 4 },
  { id: 5, slug: "for-telegram", name_uz: "Telegram uchun", name_ru: "Для Telegram", name_en: "For Telegram", position: 5 },
  { id: 6, slug: "seeking-investment", name_uz: "Investitsiya izlayman", name_ru: "Ищу инвестиции", name_en: "Seeking Investment", position: 6 },
  { id: 7, slug: "seeking-team", name_uz: "Jamoaga odam izlayman", name_ru: "Ищу людей в команду", name_en: "Hiring a Team", position: 7 },
  { id: 8, slug: "seeking-partners", name_uz: "Hamkorlar izlayman", name_ru: "Ищу партнёров", name_en: "Seeking Partners", position: 8 },
  { id: 9, slug: "other", name_uz: "Boshqa", name_ru: "Прочее", name_en: "Other", position: 9 },
];

export const CATEGORY_EMOJI: Record<string, string> = {
  startups: "🚀",
  "ai-assistants": "🤖",
  "telegram-bots": "✈️",
  "for-websites": "🌐",
  "for-telegram": "💬",
  "seeking-investment": "💰",
  "seeking-team": "👥",
  "seeking-partners": "🤝",
  other: "✨",
};

export function findCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function findCategoryById(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
