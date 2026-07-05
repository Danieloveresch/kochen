"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const router = useRouter();

  async function submit() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setErr(true);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-white px-6">
      <div className="w-full max-w-md">
        <div className="font-disp font-semibold tracking-wide text-[15px]">
          Daniel Overesch<span className="text-blue">.</span>
        </div>
        <h1 className="font-disp font-semibold text-4xl mt-6 leading-tight">
          Schön, dass du da bist.
        </h1>
        <div className="w-14 h-1 bg-blue rounded mt-5 mb-5" />
        <p className="text-inksoft max-w-sm leading-relaxed">
          Alles, was ich koche – an einem Ort und im gleichen Look. Zugang für
          Freunde &amp; Familie.
        </p>
        <div className="flex gap-2 mt-6">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Zugangswort"
            className="flex-1 rounded-xl border-2 border-line px-4 py-3.5 outline-none focus:border-blue"
          />
          <button
            onClick={submit}
            className="font-disp font-semibold rounded-xl bg-blue px-6 text-white hover:bg-bluedeep transition"
          >
            Öffnen
          </button>
        </div>
        {err && (
          <p className="mt-3 text-sm text-coral">Das Wort stimmt nicht ganz.</p>
        )}
      </div>
    </main>
  );
}
