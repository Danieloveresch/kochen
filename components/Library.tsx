"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type R = {
  id: string;
  title: string;
  category: string;
  cuisine: string | null;
  time_min: number | null;
  source: string | null;
  color: string | null;
  rating: number | null;
  ratingCount: number;
  tags: string[] | null;
  created_at: string;
};

const CHAPTERS = [
  "Alle",
  "Vorspeisen",
  "Suppen",
  "Salate",
  "Hauptgerichte",
  "Beilagen",
  "Desserts",
  "Backen & Brot",
  "Grundlagen",
];
const SRC: Record<string, string> = {
  own: "✎ Eigenes Rezept",
  book: "📖 Aus Kochbuch",
  link: "🔗 Web-Link",
};
const fmt = (n: number) => n.toFixed(1).replace(".", ",");

export default function Library({
  recipes,
  initialTag,
}: {
  recipes: R[];
  initialTag?: string;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Alle");
  const [sort, setSort] = useState("chapter");
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [tag, setTag] = useState<string | null>(initialTag ?? null);

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem("merkliste") || "[]"));
    } catch {}
  }, []);

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem("merkliste", JSON.stringify(next));
      return next;
    });
  }

  const allTags = useMemo(() => {
    const s = new Set<string>();
    recipes.forEach((r) => (r.tags ?? []).forEach((t) => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  const list = useMemo(() => {
    let l = recipes.filter((r) => cat === "Alle" || r.category === cat);
    if (tag) l = l.filter((r) => (r.tags ?? []).includes(tag));
    if (savedOnly) l = l.filter((r) => saved.includes(r.id));
    const term = q.trim().toLowerCase();
    if (term)
      l = l.filter((r) =>
        (
          r.title +
          " " +
          r.category +
          " " +
          (r.cuisine || "") +
          " " +
          (r.tags ?? []).join(" ")
        )
          .toLowerCase()
          .includes(term)
      );
    l = [...l];
    if (sort === "chapter")
      l.sort(
        (a, b) =>
          CHAPTERS.indexOf(a.category) - CHAPTERS.indexOf(b.category) ||
          a.title.localeCompare(b.title)
      );
    if (sort === "rating") l.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "time")
      l.sort((a, b) => (a.time_min || 9999) - (b.time_min || 9999));
    if (sort === "new") l.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return l;
  }, [recipes, cat, sort, savedOnly, saved, q, tag]);

  const count = (c: string) =>
    c === "Alle" ? recipes.length : recipes.filter((r) => r.category === c).length;

  const sortBtn = (key: string, label: string) => (
    <button
      onClick={() => setSort(key)}
      className={
        "text-[13px] font-disp font-medium pb-0.5 border-b-2 transition " +
        (sort === key
          ? "text-ink border-blue"
          : "text-inksoft border-transparent hover:text-ink")
      }
    >
      {label}
    </button>
  );

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24 pt-6 border-t border-line mt-6">
      <h2 className="font-disp font-semibold text-2xl mt-8 mb-5">Alle Rezepte</h2>

      {/* Suche */}
      <div className="relative mb-4 max-w-md">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suchen: Gericht, Zutat, Küche, Tag …"
          className="w-full rounded-xl border-2 border-line px-4 py-2.5 pl-10 outline-none focus:border-blue text-sm"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inksoft">
          ⌕
        </span>
      </div>

      {/* Kapitel-Chips + Merkliste */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 [scrollbar-width:none]">
        {CHAPTERS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCat(c);
              setSavedOnly(false);
            }}
            className={
              "whitespace-nowrap px-3.5 py-2 rounded-full border-2 text-[13.5px] font-disp font-semibold transition " +
              (cat === c && !savedOnly
                ? "bg-blue text-white border-blue"
                : "border-line text-inksoft hover:border-blue")
            }
          >
            {c} ({count(c)})
          </button>
        ))}
        <button
          onClick={() => setSavedOnly((v) => !v)}
          className={
            "whitespace-nowrap px-3.5 py-2 rounded-full border-2 text-[13.5px] font-disp font-semibold transition " +
            (savedOnly
              ? "bg-coral text-white border-coral"
              : "border-line text-inksoft hover:border-coral")
          }
        >
          ♥ Merkliste ({saved.length})
        </button>
      </div>

      {/* Tag-Filter */}
      {allTags.length > 0 && (
        <div className="flex gap-2 items-center flex-wrap mb-2">
          <span className="text-xs font-disp uppercase tracking-widest text-inksoft mr-1">
            Tags
          </span>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag((cur) => (cur === t ? null : t))}
              className={
                "text-[12.5px] font-disp font-semibold px-2.5 py-1 rounded-full border-2 transition " +
                (tag === t
                  ? "bg-bluedeep text-white border-bluedeep"
                  : "border-bluetint bg-bluetint text-bluedeep hover:border-blue")
              }
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* Sortierung */}
      <div className="flex items-center justify-between gap-3 flex-wrap my-4">
        <span className="text-[13px] text-inksoft font-disp">
          {list.length} {list.length === 1 ? "Rezept" : "Rezepte"}
          {tag ? ` · #${tag}` : ""}
        </span>
        <div className="flex gap-4">
          {sortBtn("chapter", "Kapitel")}
          {sortBtn("rating", "Bestbewertet")}
          {sortBtn("time", "Schnellste")}
          {sortBtn("new", "Neueste")}
        </div>
      </div>

      {list.length === 0 && (
        <p className="text-inksoft py-10">
          Nichts gefunden – andere Suche, oder ein neues Rezept hinzufügen?
        </p>
      )}

      <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(244px,1fr))]">
        {list.map((r) => (
          <div key={r.id} className="relative group">
            <button
              onClick={() => toggleSave(r.id)}
              aria-label="Merken"
              className={
                "absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full grid place-items-center bg-white/90 transition hover:scale-110 " +
                (saved.includes(r.id) ? "text-coral" : "text-inksoft")
              }
            >
              ♥
            </button>
            <Link href={`/rezept/${r.id}`}>
              <div
                className="h-44 rounded-2xl relative overflow-hidden shadow-[0_10px_30px_-18px_rgba(40,50,59,.22)] transition group-hover:-translate-y-1"
                style={{ background: r.color ?? "#E9F7FD" }}
              >
                <span className="absolute inset-0 flex items-end p-4 font-disp font-semibold text-xl text-ink pr-12">
                  {r.title}
                </span>
                {r.source && (
                  <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold font-disp bg-white/90 text-ink px-2.5 py-1 rounded-full">
                    {SRC[r.source] ?? r.source}
                  </span>
                )}
              </div>
              <div className="pt-3">
                <div className="font-disp text-[10.5px] tracking-widest uppercase text-bluedeep font-semibold">
                  {r.category}
                  {r.cuisine ? ` · ${r.cuisine}` : ""}
                </div>
                <h3 className="font-disp font-semibold text-lg mt-1 leading-tight">
                  {r.title}
                </h3>
                <div className="flex items-center gap-3 text-[12.5px] text-inksoft mt-2">
                  {r.time_min && <span>⏱ {r.time_min} Min</span>}
                  {r.rating ? (
                    <span className="text-sun font-semibold font-disp">
                      ★ {fmt(r.rating)}{" "}
                      <span className="text-inksoft font-normal">
                        ({r.ratingCount})
                      </span>
                    </span>
                  ) : (
                    <span className="text-inksoft">★ neu</span>
                  )}
                </div>
                {(r.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(r.tags ?? []).slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10.5px] font-disp font-semibold text-bluedeep bg-bluetint px-2 py-0.5 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
