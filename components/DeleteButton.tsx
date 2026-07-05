"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("Dieses Rezept wirklich löschen?")) return;
    setBusy(true);
    const res = await fetch(`/api/rezepte/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      alert("Löschen hat nicht geklappt.");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="flex items-center gap-2 text-sm font-disp font-semibold border-2 border-line text-inksoft rounded-lg px-3 py-2 hover:border-coral hover:text-coral transition disabled:opacity-50"
    >
      🗑 Löschen
    </button>
  );
}
