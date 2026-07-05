"use client";
import { useEffect, useState } from "react";

export default function SaveButton({ id }: { id: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("merkliste") || "[]");
      setOn(s.includes(id));
    } catch {}
  }, [id]);

  function toggle() {
    let s: string[] = [];
    try {
      s = JSON.parse(localStorage.getItem("merkliste") || "[]");
    } catch {}
    const next = s.includes(id) ? s.filter((x) => x !== id) : [...s, id];
    localStorage.setItem("merkliste", JSON.stringify(next));
    setOn(next.includes(id));
  }

  return (
    <button
      onClick={toggle}
      className={
        "flex items-center gap-2 text-sm font-disp font-semibold border-2 rounded-lg px-3 py-2 transition " +
        (on ? "text-coral border-coral" : "text-inksoft border-line hover:border-ink")
      }
    >
      {on ? "♥ Gemerkt" : "♡ Merken"}
    </button>
  );
}
