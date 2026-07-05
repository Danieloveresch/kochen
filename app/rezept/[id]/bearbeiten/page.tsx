import { notFound } from "next/navigation";
import Header from "@/components/Header";
import RecipeForm from "@/components/RecipeForm";
import { supabaseAdmin, type Recipe } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: { id: string };
}) {
  const { data } = await supabaseAdmin
    .from("recipes")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const r = data as Recipe;

  const initial = {
    title: r.title ?? "",
    category: r.category ?? "Hauptgerichte",
    cuisine: r.cuisine ?? "",
    time_min: r.time_min ? String(r.time_min) : "",
    servings: r.servings ? String(r.servings) : "",
    difficulty: r.difficulty ?? "Einfach",
    source: r.source ?? "own",
    lede: r.lede ?? "",
    note: r.note ?? "",
    ingredients: (r.ingredients ?? [])
      .map((a) => `${a[0]}${a[1] ? " | " + a[1] : ""}`)
      .join("\n"),
    steps: (r.steps ?? []).join("\n"),
    tags: (r.tags ?? []).join(", "),
  };

  return (
    <>
      <Header />
      <RecipeForm initial={initial} recipeId={r.id} />
    </>
  );
}
