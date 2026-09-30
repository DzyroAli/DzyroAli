import type { Locale } from "./types";

export interface City {
  /** Stable identifier stored in `profiles.city`. */
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  lat: number;
  lng: number;
}

/**
 * Regional centres of Uzbekistan with real coordinates. This is reference data,
 * not per-product invention: the map projects markers from these values and a
 * profile's `city` column holds one of these slugs.
 */
export const CITIES: City[] = [
  { slug: "tashkent", name_uz: "Toshkent", name_ru: "Ташкент", name_en: "Tashkent", lat: 41.2995, lng: 69.2401 },
  { slug: "samarkand", name_uz: "Samarqand", name_ru: "Самарканд", name_en: "Samarkand", lat: 39.6542, lng: 66.9597 },
  { slug: "bukhara", name_uz: "Buxoro", name_ru: "Бухара", name_en: "Bukhara", lat: 39.7747, lng: 64.4286 },
  { slug: "namangan", name_uz: "Namangan", name_ru: "Наманган", name_en: "Namangan", lat: 40.9983, lng: 71.6726 },
  { slug: "andijan", name_uz: "Andijon", name_ru: "Андижан", name_en: "Andijan", lat: 40.7821, lng: 72.3442 },
  { slug: "fergana", name_uz: "Farg‘ona", name_ru: "Фергана", name_en: "Fergana", lat: 40.3864, lng: 71.7864 },
  { slug: "nukus", name_uz: "Nukus", name_ru: "Нукус", name_en: "Nukus", lat: 42.46, lng: 59.6166 },
  { slug: "karshi", name_uz: "Qarshi", name_ru: "Карши", name_en: "Karshi", lat: 38.8606, lng: 65.7847 },
  { slug: "termez", name_uz: "Termiz", name_ru: "Термез", name_en: "Termez", lat: 37.2242, lng: 67.2783 },
  { slug: "urgench", name_uz: "Urganch", name_ru: "Ургенч", name_en: "Urgench", lat: 41.55, lng: 60.6333 },
  { slug: "jizzakh", name_uz: "Jizzax", name_ru: "Джизак", name_en: "Jizzakh", lat: 40.1158, lng: 67.8422 },
  { slug: "navoiy", name_uz: "Navoiy", name_ru: "Навои", name_en: "Navoi", lat: 40.0844, lng: 65.3792 },
  { slug: "gulistan", name_uz: "Guliston", name_ru: "Гулистан", name_en: "Gulistan", lat: 40.4897, lng: 68.7842 },
  { slug: "nurafshon", name_uz: "Nurafshon", name_ru: "Нурафшан", name_en: "Nurafshon", lat: 41.0167, lng: 69.3667 },
];

const BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export function findCity(slug: string | null | undefined): City | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

export function cityName(city: City, locale: string): string {
  if (locale === "ru") return city.name_ru;
  if (locale === "en") return city.name_en;
  return city.name_uz;
}

/** Localized label for a stored city slug, or null when unset/unknown. */
export function cityLabel(
  slug: string | null | undefined,
  locale: string
): string | null {
  const city = findCity(slug);
  return city ? cityName(city, locale) : null;
}

export const COUNTRY_NAME: Record<Locale, string> = {
  uz: "O‘zbekiston",
  ru: "Узбекистан",
  en: "Uzbekistan",
};
