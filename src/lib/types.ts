export type Locale = "uz" | "ru" | "en";

export type ProductStatus = "pending" | "approved" | "rejected";

export interface Category {
  id: number;
  slug: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  position: number;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  telegram_username: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  website_url: string | null;
  telegram_url: string | null;
  logo_url: string | null;
  category_id: number;
  status: ProductStatus;
  created_by: string | null;
  votes_count: number;
  comments_count: number;
  launched_at: string;
  created_at: string;
  category?: Category | null;
  maker?: Profile | null;
  period_votes?: number;
}

export interface Comment {
  id: string;
  product_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  author?: Profile | null;
}

export interface AdminStats {
  totalProducts: number;
  pendingProducts: number;
  totalUsers: number;
  totalVotes: number;
  totalComments: number;
  subscribers: number;
}

export type RankingPeriod = "day" | "week" | "month";

export function categoryName(category: Category, locale: string): string {
  if (locale === "ru") return category.name_ru;
  if (locale === "en") return category.name_en;
  return category.name_uz;
}
