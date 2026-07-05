import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Stars from "@/components/Stars";
import SaveButton from "@/components/SaveButton";
import DeleteButton from "@/components/DeleteButton";
import Ingredients from "@/components/Ingredients";
import { supabaseAdmin, type Recipe } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function RecipePage({
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

  const { data: rts } = await supabaseAdmin
    .from("ratings")
    .select("stars")
    .eq("recipe_id", params.id);
  const count = rts?.length ?? 0;
  const avg = count ? (rts as any[]).reduce((a, b) => a + b.stars, 0) / count : null;

  return (
    <>
      <Header />
      <article className="max-w-3xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mt-6 gap-2 flex-wrap">
          <Link
            href="/"
            className="text-sm font-disp font-semibold text-inksoft hover:text-ink"
          >
            ← Zurück
          </Link>
          <div className="flex gap-2">
            <SaveButton id={r.id} />
            <Link
              href={`/rezept/${r.id}/bearbeiten`}
              className="flex items-center gap-2 text-sm font-disp font-semibold border-2 border-line text-inksoft rounded-lg px-3 py-2 hover:border-ink hover:text-ink transition"
            >
              ✎ Bearbeiten
            </Link>
            <DeleteButton id={r.id} />
          </div>
        </div>

        <div
          className="h-72 rounded-2xl mt-5 relative overflow-hidden shadow-[0_10px_30px_-18px_rgba(40,50,59,.22)]"
          style={{ background: r.color ?? "#E9F7FD" }}
        >
          <span className="absolute inset-0 flex items-end p-6 font-disp font-semibold text-3xl text-ink">
            {r.title}
          </span>
        </div>

        <div className="mt-7">
          <div className="font-disp text-xs tracking-widest uppercase text-bluedeep font-semibold">
            {r.category}
            {r.cuisine ? ` · ${r.cuisine}` : ""}
          </div>
          <h1 className="font-disp font-semibold text-4xl mt-3 leading-tight">
            {r.title}
          </h1>
          {r.lede && (
            <p className="text-inksoft text-lg mt-3 leading-relaxed">{r.lede}</p>
          )}

          {(r.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(r.tags ?? []).map((t) => (
                <Link
                  key={t}
                  href={`/?tag=${encodeURIComponent(t)}`}
                  className="text-[13px] font-disp font-semibold text-bluedeep bg-bluetint px-3 py-1 rounded-full hover:bg-blue hover:text-white transition"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          <Stars recipeId={r.id} avg={avg} count={count} />
        </div>

        {/* Metabar */}
        <div className="flex mt-7 border border-line rounded-2xl overflow-hidden">
          {[
            [r.time_min ? `${r.time_min}` : "–", "Minuten"],
            [r.servings ? `${r.servings}` : "–", "Portionen"],
            [r.difficulty ?? "–", "Aufwand"],
            [`${r.ingredients?.length ?? 0}`, "Zutaten"],
          ].map(([v, l], i) => (
            <div
              key={i}
              className="flex-1 text-center py-4 border-r border-line last:border-r-0"
            >
              <b className="font-disp text-xl block">{v}</b>
              <span className="text-[10.5px] uppercase tracking-wide text-inksoft font-disp">
                {l}
              </span>
            </div>
          ))}
        </div>

        {/* Zutaten (skalierbar) + Zubereitung */}
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-10 mt-10">
          <Ingredients
            ingredients={r.ingredients ?? []}
            baseServings={r.servings}
          />
          <div>
            <h4 className="font-disp text-sm font-bold uppercase tracking-wide pb-2 border-b-[3px] border-blue inline-block mb-4">
              Zubereitung
            </h4>
            <ol className="flex flex-col gap-5">
              {(r.steps ?? []).map((s, i) => (
                <li key={i} className="flex gap-4 text-[15px] leading-relaxed">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-bluetint text-bluedeep grid place-items-center font-disp font-bold">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {r.note && (
          <div className="mt-10 border border-line border-l-4 border-l-blue rounded-r-2xl p-5">
            <div className="font-disp text-xs tracking-widest uppercase font-bold text-bluedeep mb-2">
              Notiz
            </div>
            <p className="text-[14.5px] leading-relaxed">{r.note}</p>
          </div>
        )}
      </article>
    </>
  );
}
