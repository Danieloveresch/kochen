# Daniel Overesch – Küche

Deine private Rezeptsammlung. Next.js + Supabase, passwortgeschützt.
Diese Anleitung ist zum Abhaken – alles im Browser, kein Terminal nötig.

---

## Was drin ist

- Echter Passwortschutz (ein Zugangswort für Freunde & Familie)
- Supabase-Datenbank für Rezepte
- Startseite mit Rezept-Kacheln, Detailseite im einheitlichen Look
- **Foto → Rezept**: Foto hochladen, Text wird automatisch erkannt und in die Schablone gebracht
- **Link → Rezept**: Rezept-Link einwerfen, wird importiert und ins gleiche Layout übersetzt
- Alles landet in derselben editierbaren Schablone – du prüfst kurz und speicherst
- **Bewerten**: Sterne auf der Detailseite (Ø + Anzahl, wie im Food-Magazin)
- **Merkliste**: Herz-Button, pro Gerät im Browser gespeichert
- **Suche + Kapitel-Filter + Sortierung** (Kapitel / Bestbewertet / Schnellste / Neueste)
- **Tags** (z. B. #ChefCocks fuer deinen Kochclub) – anklickbar, mit eigenem Filter
- **Portionen skalieren** – Mengen rechnen sich live hoch/runter
- **Einkaufsliste** – Zutaten aus einem Rezept auf die Liste, abhakbar (pro Geraet)
- **Bearbeiten & Loeschen** jederzeit

Damit ist die App rund. Optionale Ausbaustufen: eigenes Foto pro Rezept
(Supabase Storage), mehrere Sammlungen, Export/Druck.

> Hinweis: Wenn du das Datenbank-Schema schon frueher ausgefuehrt hast,
> fuehre `supabase/schema.sql` einfach erneut aus – der ALTER-Befehl darin
> ergaenzt nur die neue Tag-Spalte, ohne Daten zu verlieren.

---

## Schritt 1 — Supabase (Datenbank)

1. Auf **supabase.com** mit GitHub anmelden → **New Project** (Region Europa).
2. Links **SQL Editor** → **New query** → Inhalt von `supabase/schema.sql` einfügen → **Run**.
3. **Project Settings → API**: **Project URL** (= `SUPABASE_URL`) und den
   **service_role**-Key (= `SUPABASE_SERVICE_ROLE_KEY`) kopieren.
   ⚠️ service_role ist geheim – nur in Vercel eintragen, nie ins Frontend.

## Schritt 2 — Anthropic-Key (für Foto & Link)

1. Auf **console.anthropic.com** anmelden → **API Keys** → **Create Key**.
2. Key kopieren (= `ANTHROPIC_API_KEY`). Etwas Guthaben aufladen.
   Pro Foto/Link fallen nur Bruchteile eines Cents an.

## Schritt 3 — GitHub

Neues Repository anlegen und alle Dateien dieses Ordners hochladen.

## Schritt 4 — Vercel

1. **vercel.com** → **Add New → Project** → dein Repo importieren.
2. **Environment Variables** eintragen:

   | Name | Wert |
   |------|------|
   | `SITE_PASSWORD` | dein Zugangswort |
   | `ACCESS_TOKEN` | langer Zufallsstring |
   | `SUPABASE_URL` | aus Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | aus Supabase |
   | `ANTHROPIC_API_KEY` | aus Anthropic |

3. **Deploy**.

## Schritt 5 — Domain

Vercel → Settings → Domains → `rezepte.overes.ch` → den CNAME bei do.de eintragen.

---

## Bedienung

- Oben rechts **＋ Rezept** → `/neu`.
  - **Foto hochladen**: Bild wählen → wird gelesen → Felder füllen sich → prüfen → speichern.
  - **Per Link**: URL einfügen → „Holen" → Felder füllen sich → prüfen → speichern.
  - **Manuell**: direkt in die Schablone tippen.
- Zutaten im Format `Name | Menge` (eine pro Zeile).

## Wenn etwas hakt

- „Datenbank nicht verbunden" → Supabase-Env-Variablen in Vercel prüfen, dann neu deployen.
- Foto/Link bringt Fehler → meist fehlt/falsch der `ANTHROPIC_API_KEY` oder kein Guthaben.
- Manche Seiten lassen sich nicht importieren (Login/Blockade) → dann Foto oder manuell.
- Build schlägt fehl → Build-Log aus Vercel kopieren und schicken.
