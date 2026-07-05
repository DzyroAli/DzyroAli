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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const ctx = guard();
  if ("error" in ctx) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("projects")
    .select("id,title,format,slides,created_at,updated_at")
    .eq("user_id", ctx.user.id)
    .eq("id", params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    project: {
      id: data.id,
      title: data.title,
      format: data.format,
      slides: data.slides,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = guard();
  if ("error" in ctx) return ctx.error;

  const { error } = await ctx.supabase
    .from("projects")
    .delete()
    .eq("user_id", ctx.user.id)
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
