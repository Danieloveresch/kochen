import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-5">
        <Link href="/" className="font-disp font-semibold text-lg whitespace-nowrap">
          Daniel Overesch<span className="text-blue">.</span>
          <span className="ml-2 text-[9px] tracking-widest font-semibold text-inksoft align-middle">
            KÜCHE
          </span>
        </Link>
        <div className="flex-1" />
        <Link
          href="/einkaufsliste"
          className="font-disp font-semibold text-sm text-inksoft hover:text-ink transition"
          aria-label="Einkaufsliste"
        >
          🛒
        </Link>
        <Link
          href="/neu"
          className="font-disp font-semibold text-sm bg-ink text-white px-4 py-2.5 rounded-xl hover:bg-coral transition"
        >
          ＋ Rezept
        </Link>
      </div>
    </header>
  );
}
