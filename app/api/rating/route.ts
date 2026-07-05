import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { recipeId, stars } = await req.json();
  const s = Number(stars);
  if (!recipeId || !(s >= 1 && s <= 5)) {
    return NextResponse.json({ error: "Ungültige Bewertung." }, { status: 400 });
  }
  const { error } = await supabaseAdmin
    .from("ratings")
    .insert({ recipe_id: recipeId, stars: s });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
