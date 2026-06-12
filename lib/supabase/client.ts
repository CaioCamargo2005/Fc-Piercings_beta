import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Cliente para uso no BROWSER (componentes client-side).
 * Usa a ANON KEY — segura para expor ao público.
 * As permissões são controladas pelas Row Level Security (RLS) policies.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
