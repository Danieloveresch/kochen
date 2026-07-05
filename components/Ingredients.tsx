"use client";
import { useState } from "react";

function toNum(s: string): number {
  const map: Record<string, string> = {
    "½": "0.5",
    "¼": "0.25",
    "¾": "0.75",
    "⅓": "0.333",
    "⅔": "0.667",
  };
  let t = s;
  for (const [k, v] of Object.entries(map)) t = t.split(k).join(v);
  return parseFloat(t.replace(",", "."));
}

function fmtNum(n: number): string {
  let out: number;
  if (n >= 10) out = Math.round(n);
  else out = Math.round(n * 100) / 100;
  return String(out).replace(".", ",");
}

function scaleAmount(amount: string, factor: number): string {
  const s = (amount || "").trim();
  if (!s || factor === 1) return s;
  const range = s.match(/^([\d.,½¼¾⅓⅔]+)\s*[-–]\s*([\d.,½¼¾⅓⅔]+)(.*)$/);
  if (range) {
    const a = toNum(range[1]);
    const b = toNum(range[2]);
    if (!isNaN(a) && !isNaN(b))
      return `${fmtNum(a * factor)}–${fmtNum(b * factor)}${range[3]}`;
  }
  const m = s.match(/^([\d.,½¼¾⅓⅔]+)(.*)$/);
  if (m) {
    const n = toNum(m[1]);
    if (!isNaN(n)) return `${fmtNum(n * factor)}${m[2]}`;
  }
  return s; // z.B. "reichlich", "1 Prise"
}

export default function Ingredients({
  ingredients,
  baseServings,
}: {
  ingredients: [string, string][];
  baseServings: number | null;
}) {
  const base = baseServings && baseServings > 0 ? baseServings : 4;
  const [servings, setServings] = useState(base);
  const [added, setAdded] = useState(false);
  const factor = servings / base;

  function addToList() {
    let list: any[] = [];
    try {
      list = JSON.parse(localStorage.getItem("einkauf") || "[]");
    } catch {}
    ingredients.forEach(([name, amount]) => {
      list.push({ name, amount: scaleAmount(amount, factor), done: false });
    });
    localStorage.setItem("einkauf", JSON.stringify(list));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h4 className="font-disp text-sm font-bold uppercase tracking-wide pb-2 border-b-[3px] border-blue inline-block">
          Zutaten
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-inksoft font-disp">Portionen</span>
          <div className="flex items-center border-2 border-line rounded-lg">
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="px-2.5 py-1 text-inksoft hover:text-ink"
            >
              −
            </button>
            <span className="px-2 font-disp font-semibold tabular-nums">
              {servings}
            </span>
            <button
              onClick={() => setServings((s) => s + 1)}
              className="px-2.5 py-1 text-inksoft hover:text-ink"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {ingredients.map((ing, i) => (
          <li
            key={i}
            className="flex justify-between gap-3 text-[14.5px] pb-3 border-b border-line"
          >
            <span>{ing[0]}</span>
            <span className="text-inksoft font-disp whitespace-nowrap">
              {scaleAmount(ing[1], factor)}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={addToList}
        className="mt-5 w-full font-disp font-semibold text-sm border-2 border-blue text-bluedeep rounded-xl py-2.5 hover:bg-bluetint transition"
      >
        {added ? "✓ Auf der Einkaufsliste" : "🛒 Auf die Einkaufsliste"}
      </button>
    </div>
  );
}
