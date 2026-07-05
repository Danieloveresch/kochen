// Serverseitige Erkennung: Foto oder Web-Link -> strukturiertes Rezept.
// Nutzt die Anthropic-API (Claude) fuer die Foto-Erkennung und als Fallback bei Links.

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

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

const SYSTEM = `Du extrahierst Kochrezepte und gibst AUSSCHLIESSLICH ein JSON-Objekt zurueck.
Kein Markdown, keine Code-Bloecke, keine Erklaerung. Nur das JSON.

Schema:
{
  "title": string,
  "category": eine von ${JSON.stringify(CATS)},
  "cuisine": string oder null,
  "time_min": number oder null,
  "servings": number oder null,
  "difficulty": "Einfach" | "Mittel" | "Anspruchsvoll",
  "lede": string oder null,   // ein knapper, appetitlicher Satz in eigenen Worten
  "note": string oder null,   // optionaler Tipp
  "ingredients": [[name, menge], ...],   // z.B. [["Mehl","250 g"],["Eier","3"]]
  "steps": [string, ...],     // klare Schritte, in EIGENEN Worten umformuliert, nicht woertlich kopiert
  "tags": [string, ...]       // 1-3 kurze, allgemeine Schlagwoerter, z.B. ["vegetarisch","schnell","sommerlich"]
}

Alles auf Deutsch. Fehlende Angaben sinnvoll schaetzen oder null setzen.
Waehle die passendste Kategorie aus der Liste.`;

type Extracted = {
  title: string;
  category: string;
  cuisine: string | null;
  time_min: number | null;
  servings: number | null;
  difficulty: string;
  lede: string | null;
  note: string | null;
  ingredients: [string, string][];
  steps: string[];
  tags?: string[];
  source?: string;
};

async function callClaude(userContent: any): Promise<Extracted> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY fehlt (in Vercel eintragen).");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!res.ok) {
    throw new Error("Anthropic-API " + res.status + ": " + (await res.text()));
  }
  const data = await res.json();
  const text = (data.content || [])
    .map((b: any) => (b.type === "text" ? b.text : ""))
    .join("");
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

export async function extractFromImage(
  base64: string,
  mediaType: string
): Promise<Extracted> {
  const r = await callClaude([
    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
    {
      type: "text",
      text:
        "Lies dieses Rezept (Foto einer Kochbuchseite, eines handschriftlichen Zettels oder eines Gerichts mit Text) und gib das JSON gemaess Schema zurueck.",
    },
  ]);
  return { ...r, source: "own" };
}

export async function extractFromUrl(url: string): Promise<Extracted> {
  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (RezeptImport)" },
    });
    html = await res.text();
  } catch {
    throw new Error("Seite konnte nicht geladen werden.");
  }

  // 1) Strukturierte Daten (schema.org/Recipe) - schnell & genau
  const ld = findRecipeJsonLd(html);
  if (ld) return { ...mapJsonLd(ld), source: "link" };

  // 2) Fallback: Text an Claude
  const text = htmlToText(html).slice(0, 12000);
  const r = await callClaude([
    { type: "text", text: `Extrahiere das Rezept von dieser Seite (${url}):\n\n${text}` },
  ]);
  return { ...r, source: "link" };
}

// ---------- Helfer fuer JSON-LD ----------

function findRecipeJsonLd(html: string): any | null {
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const found = searchRecipe(parsed);
      if (found) return found;
    } catch {
      /* ignorieren */
    }
  }
  return null;
}

function searchRecipe(node: any): any | null {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = searchRecipe(n);
      if (r) return r;
    }
    return null;
  }
  if (typeof node === "object") {
    const t = node["@type"];
    if (t === "Recipe" || (Array.isArray(t) && t.includes("Recipe"))) return node;
    if (node["@graph"]) return searchRecipe(node["@graph"]);
  }
  return null;
}

function mapJsonLd(r: any): Extracted {
  const ingredients: [string, string][] = (r.recipeIngredient || []).map(
    (s: string) => splitIngredient(String(s))
  );

  let steps: string[] = [];
  const instr = r.recipeInstructions;
  if (Array.isArray(instr)) {
    steps = instr
      .map((x: any) => (typeof x === "string" ? x : x?.text || x?.name || ""))
      .filter(Boolean);
  } else if (typeof instr === "string") {
    steps = instr.split(/\n+|(?<=\.)\s+(?=[A-ZÄÖÜ])/).filter(Boolean);
  }

  return {
    title: r.name || "Importiertes Rezept",
    category: "Hauptgerichte",
    cuisine: pickFirst(r.recipeCuisine),
    time_min: parseDuration(r.totalTime || r.cookTime || r.prepTime),
    servings: parseServings(r.recipeYield),
    difficulty: "Mittel",
    lede:
      typeof r.description === "string" ? r.description.slice(0, 160) : null,
    note: null,
    ingredients,
    steps,
    tags:
      typeof r.keywords === "string"
        ? r.keywords.split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 4)
        : Array.isArray(r.keywords)
        ? r.keywords.slice(0, 4)
        : [],
  };
}

function splitIngredient(s: string): [string, string] {
  const str = s.trim();
  const m = str.match(
    /^([\d.,/¼½¾\s-]+\s?(?:g|kg|ml|l|EL|TL|Prise|Prisen|Stk|Stück|Dose|Dosen|Bund|Packung|Pck|Zehen?|Scheiben?|Tasse|Tassen)?\.?)\s+(.+)$/i
  );
  if (m && m[2]) return [m[2].trim(), m[1].trim()];
  return [str, ""];
}

function pickFirst(v: any): string | null {
  if (!v) return null;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

function parseDuration(v: any): number | null {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (m && (m[1] || m[2])) {
    return parseInt(m[1] || "0") * 60 + parseInt(m[2] || "0") || null;
  }
  const n = parseInt(s);
  return isNaN(n) ? null : n;
}

function parseServings(v: any): number | null {
  if (!v) return null;
  const val = Array.isArray(v) ? v[0] : v;
  const m = String(val).match(/\d+/);
  return m ? parseInt(m[0]) : null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
