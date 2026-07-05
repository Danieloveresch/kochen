"use client";
import { useState } from "react";

const fmt = (n: number) => n.toFixed(1).replace(".", ",");

export default function Stars({
  recipeId,
  avg,
  count,
}: {
  recipeId: string;
  avg: number | null;
  count: number;
}) {
  const [hover, setHover] = useState(0);
  const [mine, setMine] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const filled = hover || mine || Math.round(avg || 0);

  async function rate(v: number) {
    if (busy) return;
    setBusy(true);
    setMine(v);
    try {
      await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, stars: v }),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 mt-4 flex-wrap">
      <div className="flex gap-1 text-2xl text-sun">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => rate(i)}
            className={
              "cursor-pointer transition hover:scale-110 " +
              (i <= filled ? "" : "text-line")
            }
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm text-inksoft font-disp">
        {avg
          ? `${fmt(avg)} · ${count} ${count === 1 ? "Bewertung" : "Bewertungen"}`
          : "Noch keine Bewertung"}
        {mine ? ` · deine: ${mine}★` : ""}
      </span>
    </div>
  );
}
