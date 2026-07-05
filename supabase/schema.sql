-- Im Supabase-Dashboard: SQL Editor -> New query -> alles hier einfuegen -> Run.
-- Falls du das Schema schon einmal ausgefuehrt hast, genuegt der ALTER-Block unten
-- (fuegt die Tag-Spalte nachtraeglich hinzu).

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Grundlagen',
  cuisine text,
  time_min int,
  servings int,
  difficulty text,
  source text default 'own',            -- own | book | link
  lede text,
  note text,
  ingredients jsonb not null default '[]'::jsonb,  -- [["Mehl","250 g"], ...]
  steps jsonb not null default '[]'::jsonb,        -- ["Schritt 1", ...]
  color text default '#E9F7FD',
  tags text[] not null default '{}',               -- z.B. {ChefCocks,Sommer}
  created_at timestamptz not null default now()
);

-- Falls recipes schon existierte (ohne Tags):
alter table recipes add column if not exists tags text[] not null default '{}';

create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  stars int check (stars between 1 and 5),
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;
alter table ratings enable row level security;

-- Ein paar Startrezepte (nur einfuegen, wenn noch leer)
insert into recipes (title, category, cuisine, time_min, servings, difficulty, source, lede, note, ingredients, steps, color, tags)
select * from (values
('Spaghetti Carbonara','Hauptgerichte','Italienisch',25,2,'Mittel','link',
 'Vier Zutaten, null Sahne, maximale Cremigkeit.',
 'Die Cremigkeit kommt aus Ei und Kochwasser, nie aus Sahne.',
 '[["Spaghetti","200 g"],["Guanciale","100 g"],["Eigelb","3"],["Pecorino","50 g"],["Pfeffer","reichlich"]]'::jsonb,
 '["Nudeln bissfest kochen.","Guanciale knusprig auslassen.","Eigelb mit Pecorino verruehren.","Nudeln mit etwas Kochwasser cremig ziehen - ohne Hitze."]'::jsonb,
 '#FBEFCB', '{ChefCocks,schnell}'::text[]),
('Kuerbissuppe mit Ingwer','Suppen','Herbst',35,4,'Einfach','own',
 'Samtig, waermend und mit einer Ingwer-Schaerfe, die wach macht.',
 'Schmeckt am naechsten Tag noch besser.',
 '[["Hokkaido-Kuerbis","1 kg"],["Zwiebel","1"],["Ingwer","20 g"],["Gemuesebruehe","800 ml"],["Kokosmilch","200 ml"]]'::jsonb,
 '["Kuerbis, Zwiebel und Ingwer wuerfeln.","In Oel 5 Min anschwitzen.","Mit Bruehe aufgiessen, 20 Min koecheln.","Kokosmilch zugeben und fein puerieren."]'::jsonb,
 '#FFE7CC', '{vegetarisch}'::text[]),
('Rinderrouladen','Hauptgerichte','Deutsch',130,4,'Mittel','book',
 'Der Sonntagsklassiker, langsam geschmort bis er zerfaellt.',
 'Der Bratensatz ist die halbe Miete - nicht wegschuetten.',
 '[["Rouladenfleisch","4 Scheiben"],["Senf","3 EL"],["Speck","4 Scheiben"],["Gewuerzgurken","2"],["Zwiebeln","2"],["Rinderfond","500 ml"]]'::jsonb,
 '["Fleisch mit Senf bestreichen, wuerzen.","Belegen, aufrollen, fixieren.","Rundum scharf anbraten.","Mit Fond abloeschen, 90 Min schmoren.","Sauce einkochen und abschmecken."]'::jsonb,
 '#F3DACE', '{Sonntag}'::text[])
) as v
where not exists (select 1 from recipes);
