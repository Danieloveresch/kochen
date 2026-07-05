"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";

type Item = { name: string; amount: string; done: boolean };

export default function Einkaufsliste() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("einkauf") || "[]"));
    } catch {}
  }, []);

  function persist(next: Item[]) {
    setItems(next);
    localStorage.setItem("einkauf", JSON.stringify(next));
  }
  const toggle = (i: number) =>
    persist(items.map((x, k) => (k === i ? { ...x, done: !x.done } : x)));
  const remove = (i: number) => persist(items.filter((_, k) => k !== i));
  const clearDone = () => persist(items.filter((x) => !x.done));
  const clearAll = () => persist([]);

  const open = items.filter((x) => !x.done).length;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 pb-24">
        <Link
          href="/"
          className="inline-block mt-6 text-sm font-disp font-semibold text-inksoft hover:text-ink"
        >
          ← Zurück
        </Link>
        <h1 className="font-disp font-semibold text-3xl mt-4">Einkaufsliste</h1>
        <p className="text-inksoft mt-2">
          {items.length === 0
            ? "Noch leer. Füge Zutaten aus einem Rezept hinzu."
            : `${open} offen · ${items.length} gesamt`}
        </p>

        {items.length > 0 && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={clearDone}
              className="text-sm font-disp font-semibold text-bluedeep"
            >
              Erledigte entfernen
            </button>
            <button
              onClick={clearAll}
              className="text-sm font-disp font-semibold text-inksoft hover:text-coral"
            >
              Liste leeren
            </button>
          </div>
        )}

        <ul className="mt-6 flex flex-col gap-1">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-center gap-3 py-2.5 border-b border-line"
            >
              <button
                onClick={() => toggle(i)}
                className={
                  "w-6 h-6 rounded-md border-2 grid place-items-center shrink-0 " +
                  (it.done
                    ? "bg-blue border-blue text-white"
                    : "border-line text-transparent")
                }
              >
                ✓
              </button>
              <span
                className={
                  "flex-1 " + (it.done ? "line-through text-inksoft" : "")
                }
              >
                {it.name}
              </span>
              <span className="text-inksoft font-disp text-sm whitespace-nowrap">
                {it.amount}
              </span>
              <button
                onClick={() => remove(i)}
                className="text-inksoft hover:text-coral px-1"
                aria-label="Entfernen"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
