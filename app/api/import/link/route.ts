import { NextResponse } from "next/server";
import { extractFromUrl } from "@/lib/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "Bitte einen gültigen Link angeben." }, { status: 400 });
    }
    const recipe = await extractFromUrl(url);
    return NextResponse.json({ ok: true, recipe });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Import fehlgeschlagen." },
      { status: 500 }
    );
  }
}
