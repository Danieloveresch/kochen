import { createClient } from "@supabase/supabase-js";

// Nur serverseitig verwenden. Der Service-Role-Key darf NIE ins Frontend.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export type Recipe = {
  id: string;
  title: string;
  category: string;
  cuisine: string | null;
  time_min: number | null;
  servings: number | null;
  difficulty: string | null;
  source: string | null; // own | book | link
  lede: string | null;
  note: string | null;
  ingredients: [string, string][];
  steps: string[];
  color: string | null;
  tags: string[] | null;
  created_at: string;
};
