import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    tags: Array.isArray(b.tags) ? b.tags : [],
  };

  if (!record.title) {
    return NextResponse.json({ error: "Titel fehlt" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("recipes")
    .update(record)
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: params.id });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from("recipes")
    .delete()
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
