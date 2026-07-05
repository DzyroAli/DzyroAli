import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

function guard() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: NextResponse.json({ error: "storage_disabled" }, { status: 501 }) };
  const user = getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  return { supabase, user };
}

export async function GET() {
  const ctx = guard();
  if ("error" in ctx) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("projects")
    .select("id,title,format,slides,created_at,updated_at")
    .eq("user_id", ctx.user.id)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    projects: (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      format: row.format,
      slides: row.slides,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
}

export async function POST(req: Request) {
  const ctx = guard();
  if ("error" in ctx) return ctx.error;

  const body = await req.json().catch(() => null);
  if (!body?.id || !Array.isArray(body.slides)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { error } = await ctx.supabase.from("projects").upsert({
    id: body.id,
    user_id: ctx.user.id,
    title: String(body.title ?? "Untitled").slice(0, 120),
    format: body.format === "1080x1350" ? "1080x1350" : "1080x1080",
    slides: body.slides,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
