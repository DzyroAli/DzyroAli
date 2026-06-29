import { CATEGORIES, findCategory } from "./categories";
import { DEMO_COMMENTS, DEMO_MAKERS, DEMO_PRODUCTS } from "./demo-data";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";
import type {
  AdminStats,
  Category,
  Comment,
  Product,
  Profile,
  RankingPeriod,
} from "./types";

// FK указан явно: между products и profiles PostgREST видит ещё два
// many-to-many пути (через votes и comments), без хинта embed отвечает HTTP 300.
const PRODUCT_SELECT =
  "*, category:categories(*), maker:profiles!products_created_by_fkey(*)";

export function getCategories(): Category[] {
  return CATEGORIES;
}

export async function getCurrentUser(): Promise<{
  userId: string | null;
  profile: Profile | null;
}> {
  if (!isSupabaseConfigured()) return { userId: null, profile: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { userId: user.id, profile: (profile as Profile) ?? null };
}

function periodSince(period: RankingPeriod): string {
  const days = period === "day" ? 1 : period === "week" ? 7 : 30;
  return new Date(Date.now() - days * 86400_000).toISOString();
}

export async function getRanking(
  period: RankingPeriod,
  limit = 10
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return [...DEMO_PRODUCTS]
      .sort((a, b) => b.demo_votes[period] - a.demo_votes[period])
      .slice(0, limit)
      .map((p) => ({ ...p, period_votes: p.demo_votes[period] }));
  }

  const supabase = await createClient();
  const { data: ranked } = await supabase.rpc("get_ranking", {
    p_since: periodSince(period),
    p_limit: limit,
  });

  const rankedRows = (ranked ?? []) as Array<{
    product_id: string;
    period_votes: number;
  }>;

  const products: Product[] = [];
  if (rankedRows.length > 0) {
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in(
        "id",
        rankedRows.map((r) => r.product_id)
      )
      .eq("status", "approved");
    const byId = new Map(
      ((data ?? []) as unknown as Product[]).map((p) => [p.id, p])
    );
    for (const row of rankedRows) {
      const p = byId.get(row.product_id);
      if (p) products.push({ ...p, period_votes: row.period_votes });
    }
  }

  // Keep the page alive on fresh installs: pad with newest approved products.
  if (products.length < Math.min(limit, 4)) {
    const newest = await getNewest(limit);
    for (const p of newest) {
      if (products.length >= limit) break;
      if (!products.some((x) => x.id === p.id)) {
        products.push({ ...p, period_votes: 0 });
      }
    }
  }

  return products;
}

export async function getNewest(limit = 5): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return [...DEMO_PRODUCTS]
      .sort((a, b) => b.launched_at.localeCompare(a.launched_at))
      .slice(0, limit);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "approved")
    .order("launched_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as Product[]);
}

export interface ProductFilters {
  categorySlug?: string;
  q?: string;
  sort?: "newest" | "top";
  page?: number;
  perPage?: number;
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<{ products: Product[]; total: number }> {
  const { categorySlug, q, sort = "top", page = 1, perPage = 20 } = filters;

  if (!isSupabaseConfigured()) {
    let items = [...DEMO_PRODUCTS];
    if (categorySlug) {
      const cat = findCategory(categorySlug);
      items = items.filter((p) => p.category_id === cat?.id);
    }
    if (q) {
      const needle = q.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.tagline.toLowerCase().includes(needle) ||
          (p.description ?? "").toLowerCase().includes(needle)
      );
    }
    items.sort((a, b) =>
      sort === "newest"
        ? b.launched_at.localeCompare(a.launched_at)
        : b.votes_count - a.votes_count
    );
    const total = items.length;
    return {
      products: items.slice((page - 1) * perPage, page * perPage),
      total,
    };
  }

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("status", "approved");

  if (categorySlug) {
    const cat = findCategory(categorySlug);
    if (!cat) return { products: [], total: 0 };
    query = query.eq("category_id", cat.id);
  }
  if (q) {
    const escaped = q.replace(/[%_,]/g, " ").trim();
    if (escaped) {
      query = query.or(
        `name.ilike.%${escaped}%,tagline.ilike.%${escaped}%,description.ilike.%${escaped}%`
      );
    }
  }
  query =
    sort === "newest"
      ? query.order("launched_at", { ascending: false })
      : query.order("votes_count", { ascending: false });

  const from = (page - 1) * perPage;
  const { data, count } = await query.range(from, from + perPage - 1);
  return {
    products: ((data ?? []) as unknown as Product[]),
    total: count ?? 0,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return (data as unknown as Product) ?? null;
}

export async function getComments(productId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_COMMENTS.filter((c) => c.product_id === productId);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("*, author:profiles!comments_user_id_fkey(*)")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  return ((data ?? []) as unknown as Comment[]);
}

export async function hasVoted(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("votes")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(data);
}

export async function isBookmarked(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("bookmarks")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(data);
}

/** Сохранённые пользователем продукты, недавние — первыми. */
export async function getBookmarkedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rows } = await supabase
    .from("bookmarks")
    .select("product_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ids = ((rows ?? []) as Array<{ product_id: string }>).map(
    (r) => r.product_id
  );
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids);

  const byId = new Map(
    ((data ?? []) as unknown as Product[]).map((p) => [p.id, p])
  );
  // Сохраняем порядок закладок (самые свежие сверху).
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));
}

export async function getMaker(
  username: string
): Promise<{ profile: Profile; products: Product[] } | null> {
  if (!isSupabaseConfigured()) {
    const profile = DEMO_MAKERS.find((m) => m.username === username);
    if (!profile) return null;
    return {
      profile,
      products: DEMO_PRODUCTS.filter((p) => p.created_by === profile.id),
    };
  }
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;
  const { data: products } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("created_by", (profile as Profile).id)
    .eq("status", "approved")
    .order("votes_count", { ascending: false });
  return {
    profile: profile as Profile,
    products: ((products ?? []) as unknown as Product[]),
  };
}

export async function getSimilar(product: Product, limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_PRODUCTS.filter(
      (p) => p.category_id === product.category_id && p.id !== product.id
    ).slice(0, limit);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "approved")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .order("votes_count", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as Product[]);
}

export async function getPendingProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return ((data ?? []) as unknown as Product[]);
}

export async function getRecentUsers(limit = 12): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return DEMO_MAKERS;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as Profile[]);
}

export async function getStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured()) {
    return {
      totalProducts: DEMO_PRODUCTS.length,
      pendingProducts: 0,
      totalUsers: DEMO_MAKERS.length,
      totalVotes: DEMO_PRODUCTS.reduce((s, p) => s + p.votes_count, 0),
      totalComments: DEMO_COMMENTS.length,
      subscribers: 0,
    };
  }
  const supabase = await createClient();
  const count = async (table: string, filter?: { col: string; val: string }) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter.col, filter.val);
    const { count: c } = await q;
    return c ?? 0;
  };
  const [totalProducts, pendingProducts, totalUsers, totalVotes, totalComments, subscribers] =
    await Promise.all([
      count("products"),
      count("products", { col: "status", val: "pending" }),
      count("profiles"),
      count("votes"),
      count("comments"),
      count("subscribers"),
    ]);
  return { totalProducts, pendingProducts, totalUsers, totalVotes, totalComments, subscribers };
}

/** Счётчики дня запуска: что произошло на платформе сегодня. */
export interface LaunchDayStats {
  productsToday: number;
  signupsToday: number;
  votesToday: number;
  commentsToday: number;
}

export async function getLaunchDayStats(): Promise<LaunchDayStats> {
  if (!isSupabaseConfigured()) {
    return { productsToday: 0, signupsToday: 0, votesToday: 0, commentsToday: 0 };
  }
  const supabase = await createClient();
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const since = dayStart.toISOString();

  const countSince = async (table: string, col: string, extra?: { col: string; val: string }) => {
    let q = supabase
      .from(table)
      .select("*", { count: "exact", head: true })
      .gte(col, since);
    if (extra) q = q.eq(extra.col, extra.val);
    const { count } = await q;
    return count ?? 0;
  };

  const [productsToday, signupsToday, votesToday, commentsToday] =
    await Promise.all([
      countSince("products", "launched_at", { col: "status", val: "approved" }),
      countSince("profiles", "created_at"),
      countSince("votes", "created_at"),
      countSince("comments", "created_at"),
    ]);
  return { productsToday, signupsToday, votesToday, commentsToday };
}

/** Все продукты для модерационной таблицы админки (любой статус). */
export async function getAdminProducts(
  status?: "pending" | "approved" | "rejected"
): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let q = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return (data ?? []) as unknown as Product[];
}

export async function getAllUsers(limit = 100): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return DEMO_MAKERS;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Profile[];
}

export interface MakerRank {
  profile: Profile;
  products: number;
  votes: number;
}

/** Лидерборд мейкеров: сумма голосов по их одобренным продуктам. */
export async function getLeaderboard(limit = 20): Promise<MakerRank[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_MAKERS.map((profile) => ({
      profile,
      products: DEMO_PRODUCTS.filter((p) => p.created_by === profile.id).length,
      votes: DEMO_PRODUCTS.filter((p) => p.created_by === profile.id).reduce(
        (s, p) => s + p.votes_count,
        0
      ),
    })).sort((a, b) => b.votes - a.votes);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("votes_count, maker:profiles!products_created_by_fkey(*)")
    .eq("status", "approved")
    .not("created_by", "is", null)
    .limit(1000);

  const byMaker = new Map<string, MakerRank>();
  for (const row of (data ?? []) as unknown as Array<{
    votes_count: number;
    maker: Profile | null;
  }>) {
    if (!row.maker) continue;
    const entry = byMaker.get(row.maker.id) ?? {
      profile: row.maker,
      products: 0,
      votes: 0,
    };
    entry.products += 1;
    entry.votes += row.votes_count;
    byMaker.set(row.maker.id, entry);
  }
  return [...byMaker.values()]
    .sort((a, b) => b.votes - a.votes || b.products - a.products)
    .slice(0, limit);
}

export async function getAllApprovedSlugs(): Promise<
  Array<{ slug: string; updated: string }>
> {
  if (!isSupabaseConfigured()) {
    return DEMO_PRODUCTS.map((p) => ({ slug: p.slug, updated: p.launched_at }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug, launched_at")
    .eq("status", "approved")
    .limit(5000);
  return ((data ?? []) as Array<{ slug: string; launched_at: string }>).map(
    (p) => ({ slug: p.slug, updated: p.launched_at })
  );
}
