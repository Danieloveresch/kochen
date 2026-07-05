import { NextResponse } from "next/server";
import { extractFromImage } from "@/lib/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { data, mediaType } = await req.json();
    if (!data) {
      return NextResponse.json({ error: "Kein Bild empfangen." }, { status: 400 });
    }
    const recipe = await extractFromImage(data, mediaType || "image/jpeg");
    return NextResponse.json({ ok: true, recipe });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erkennung fehlgeschlagen." },
      { status: 500 }
    );
  }
}
