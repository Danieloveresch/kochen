"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATS = [
  "Vorspeisen",
  "Suppen",
  "Salate",
  "Hauptgerichte",
  "Beilagen",
  "Desserts",
  "Backen & Brot",
  "Grundlagen",
];

export type FormInitial = Partial<{
  title: string;
  category: string;
  cuisine: string;
  time_min: string;
  servings: string;
  difficulty: string;
  source: string;
  lede: string;
  note: string;
  ingredients: string;
  steps: string;
  tags: string;
}>;

const empty = {
  title: "",
  category: "Hauptgerichte",
  cuisine: "",
  time_min: "",
  servings: "",
  difficulty: "Einfach",
  source: "own",
  lede: "",
  note: "",
  ingredients: "",
  steps: "",
  tags: "",
};

export default function RecipeForm({
  initial,
  recipeId,
}: {
  initial?: FormInitial;
  recipeId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(recipeId);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [f, setF] = useState({ ...empty, ...initial });

  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  function applyExtracted(x: any) {
    setF((s) => ({
      ...s,
      title: x.title || s.title,
      category: CATS.includes(x.category) ? x.category : s.category,
      cuisine: x.cuisine || "",
      time_min: x.time_min ? String(x.time_min) : "",
      servings: x.servings ? String(x.servings) : "",
      difficulty: ["Einfach", "Mittel", "Anspruchsvoll"].includes(x.difficulty)
        ? x.difficulty
        : "Mittel",
      source: x.source || s.source,
      lede: x.lede || "",
      note: x.note || "",
      ingredients: (x.ingredients || [])
        .map((a: any) => `${a[0]}${a[1] ? " | " + a[1] : ""}`)
        .join("\n"),
      steps: (x.steps || []).join("\n"),
      tags: x.tags?.length ? x.tags.join(", ") : s.tags,
    }));
  }

  async function fileToImageData(file: File, maxDim = 1568) {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    return {
      data: canvas.toDataURL("image/jpeg", 0.85).split(",")[1],
      mediaType: "image/jpeg",
    };
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("Foto wird gelesen …");
    try {
      const { data, mediaType } = await fileToImageData(file);
      const res = await fetch("/api/import/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, mediaType }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      applyExtracted(j.recipe);
      setStatus("Erkannt ✓ Bitte unten prüfen und speichern.");
    } catch (err: any) {
      setStatus("Klappte nicht: " + (err.message || "Fehler"));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function onLink() {
    if (!linkUrl.trim()) return;
    setBusy(true);
    setStatus("Link wird importiert …");
    try {
      const res = await fetch("/api/import/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl.trim() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      applyExtracted(j.recipe);
      setStatus("Importiert ✓ Bitte unten prüfen und speichern.");
    } catch (err: any) {
      setStatus("Klappte nicht: " + (err.message || "Fehler"));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    const ingredients = f.ingredients
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [name, amount = ""] = l.split("|").map((x) => x.trim());
        return [name, amount];
      });
    const steps = f.steps
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const tags = f.tags
      .split(/[,\n]/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const res = await fetch(
      editing ? `/api/rezepte/${recipeId}` : "/api/rezepte",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, ingredients, steps, tags }),
      }
    );
    setBusy(false);
    if (res.ok) {
      const j = await res.json();
      router.push(`/rezept/${editing ? recipeId : j.id}`);
      router.refresh();
    } else {
      alert("Speichern hat nicht geklappt.");
    }
  }

  const input =
    "w-full rounded-xl border-2 border-line px-4 py-3 outline-none focus:border-blue";
  const label = "block text-sm font-disp font-semibold mb-1.5 mt-4";

  return (
    <main className="max-w-2xl mx-auto px-6 pb-24">
      <Link
        href={editing ? `/rezept/${recipeId}` : "/"}
        className="inline-block mt-6 text-sm font-disp font-semibold text-inksoft hover:text-ink"
      >
        ← Zurück
      </Link>
      <h1 className="font-disp font-semibold text-3xl mt-4">
        {editing ? "Rezept bearbeiten" : "Rezept hinzufügen"}
      </h1>
      <p className="text-inksoft mt-2">
        Foto knipsen, Link einwerfen – oder manuell. Alles landet in derselben
        Schablone.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        <label className="cursor-pointer rounded-2xl border-2 border-dashed border-line hover:border-blue hover:bg-bluetint transition p-6 text-center">
          <div className="text-3xl">📷</div>
          <b className="block font-disp mt-2">Foto hochladen</b>
          <span className="text-sm text-inksoft">
            Kochbuchseite, Zettel oder Gericht
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhoto}
            disabled={busy}
          />
        </label>

        <div className="rounded-2xl border-2 border-line p-6">
          <div className="text-3xl">🔗</div>
          <b className="block font-disp mt-2">Per Link</b>
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 rounded-lg border-2 border-line px-3 py-2 text-sm outline-none focus:border-blue"
              placeholder="https://…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={busy}
            />
            <button
              onClick={onLink}
              disabled={busy}
              className="font-disp font-semibold text-sm bg-blue text-white px-3 rounded-lg hover:bg-bluedeep disabled:opacity-50"
            >
              Holen
            </button>
          </div>
        </div>
      </div>

      {status && <p className="mt-3 text-sm font-disp text-bluedeep">{status}</p>}

      <div className="border-t border-line mt-8 pt-2">
        <p className="text-xs font-disp uppercase tracking-widest text-inksoft mt-4">
          Die Schablone
        </p>
      </div>

      <label className={label}>Titel</label>
      <input
        className={input}
        value={f.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="z. B. Spaghetti Carbonara"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Kategorie</label>
          <select
            className={input}
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Küche</label>
          <input
            className={input}
            value={f.cuisine}
            onChange={(e) => set("cuisine", e.target.value)}
            placeholder="Italienisch"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={label}>Zeit (Min)</label>
          <input
            className={input}
            value={f.time_min}
            onChange={(e) => set("time_min", e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={label}>Portionen</label>
          <input
            className={input}
            value={f.servings}
            onChange={(e) => set("servings", e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={label}>Aufwand</label>
          <select
            className={input}
            value={f.difficulty}
            onChange={(e) => set("difficulty", e.target.value)}
          >
            <option>Einfach</option>
            <option>Mittel</option>
            <option>Anspruchsvoll</option>
          </select>
        </div>
      </div>

      <label className={label}>Kurzbeschreibung</label>
      <input
        className={input}
        value={f.lede}
        onChange={(e) => set("lede", e.target.value)}
        placeholder="Ein Satz, worum es geht."
      />

      <label className={label}>Tags – mit Komma trennen (z. B. Kochclub)</label>
      <input
        className={input}
        value={f.tags}
        onChange={(e) => set("tags", e.target.value)}
        placeholder="ChefCocks, Sommer, schnell"
      />

      <label className={label}>
        Zutaten – eine pro Zeile, Format: Name | Menge
      </label>
      <textarea
        className={input + " h-36 resize-y"}
        value={f.ingredients}
        onChange={(e) => set("ingredients", e.target.value)}
        placeholder={"Spaghetti | 200 g\nGuanciale | 100 g\nEigelb | 3"}
      />

      <label className={label}>Zubereitung – ein Schritt pro Zeile</label>
      <textarea
        className={input + " h-36 resize-y"}
        value={f.steps}
        onChange={(e) => set("steps", e.target.value)}
        placeholder={"Nudeln bissfest kochen.\nGuanciale auslassen."}
      />

      <label className={label}>Notiz (optional)</label>
      <input
        className={input}
        value={f.note}
        onChange={(e) => set("note", e.target.value)}
      />

      <button
        onClick={save}
        disabled={busy}
        className="mt-6 w-full font-disp font-semibold rounded-xl bg-blue text-white py-4 hover:bg-bluedeep transition disabled:opacity-50"
      >
        {busy ? "Moment …" : editing ? "Änderungen speichern" : "Zur Sammlung hinzufügen"}
      </button>
    </main>
  );
}
