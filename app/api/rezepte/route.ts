import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const b = await req.json();

  const record = {
    title: (b.title ?? "").trim(),
    category: (b.category ?? "Grundlagen").trim(),
    cuisine: b.cuisine?.trim() || null,
    time_min: b.time_min ? Number(b.time_min) : null,
    servings: b.servings ? Number(b.servings) : null,
    difficulty: b.difficulty?.trim() || null,
    source: b.source || "own",
    lede: b.lede?.trim() || null,
    note: b.note?.trim() || null,
    ingredients: Array.isArray(b.ingredients) ? b.ingredients : [],
    steps: Array.isArray(b.steps) ? b.steps : [],
    color: b.color || "#E9F7FD",
    tags: Array.isArray(b.tags) ? b.tags : [],
  };

  if (!record.title) {
    return NextResponse.json({ error: "Titel fehlt" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .insert(record)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
