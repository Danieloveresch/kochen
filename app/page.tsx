import Link from "next/link";
import Header from "@/components/Header";
import Library from "@/components/Library";
import { supabaseAdmin, type Recipe } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: ratingRows } = await supabaseAdmin
    .from("ratings")
    .select("recipe_id, stars");

  const agg: Record<string, { sum: number; count: number }> = {};
  (ratingRows ?? []).forEach((r: any) => {
    const a = (agg[r.recipe_id] = agg[r.recipe_id] || { sum: 0, count: 0 });
    a.sum += r.stars;
    a.count += 1;
  });

  const recipes = ((data ?? []) as Recipe[]).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    cuisine: r.cuisine,
    time_min: r.time_min,
    source: r.source,
    color: r.color,
    tags: r.tags ?? [],
    created_at: r.created_at,
    rating: agg[r.id] ? agg[r.id].sum / agg[r.id].count : null,
    ratingCount: agg[r.id]?.count ?? 0,
  }));

  return (
    <>
      <Header />

      <section className="max-w-6xl mx-auto px-6 pt-14 pb-6">
        <span className="inline-flex items-center gap-2 font-disp text-xs font-semibold tracking-widest uppercase text-inksoft">
          <span className="w-6 h-[3px] bg-blue rounded" /> Daniels Rezeptsammlung
        </span>
        <h1 className="font-disp font-semibold text-4xl sm:text-5xl mt-4 leading-[1.05]">
          Willkommen in meiner{" "}
          <span className="relative whitespace-nowrap">
            Küche
            <span className="absolute left-0 right-0 -bottom-1 h-[6px] bg-blue rounded" />
          </span>
          .
        </h1>
        <p className="text-inksoft text-lg mt-6 max-w-xl leading-relaxed">
          Alles, was ich koche – an einem Ort und im gleichen Look. Zum
          Bewerten, Wiederfinden und mit Freunden Teilen.
        </p>
      </section>

      {error && (
        <p className="max-w-6xl mx-auto px-6 text-coral">
          Datenbank noch nicht verbunden. Trage die Supabase-Schlüssel in Vercel
          ein (siehe README).
        </p>
      )}

      {!error && recipes.length === 0 && (
        <p className="max-w-6xl mx-auto px-6 text-inksoft">
          Noch keine Rezepte.{" "}
          <Link href="/neu" className="text-bluedeep font-semibold">
            Leg das erste an →
          </Link>
        </p>
      )}

      <Library recipes={recipes} initialTag={searchParams?.tag} />
    </>
  );
}
