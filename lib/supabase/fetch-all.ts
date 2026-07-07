/* ── fetchAllRows ────────────────────────────────────────────────
   O PostgREST (API do Supabase) limita toda query a 1.000 linhas
   por padrão. Este helper busca em lotes de 1.000 usando .range()
   até esgotar os resultados, contornando o teto sem mexer no
   painel do Supabase.

   Uso:
     const rows = await fetchAllRows((from, to) =>
       supabase
         .from("products")
         .select("*, product_images(url, sort_order)")
         .eq("active", true)
         .order("created_at", { ascending: false })
         .range(from, to)
     );

   Importante: a query PRECISA ter um .order() estável, senão os
   lotes podem vir embaralhados e duplicar/pular linhas.
─────────────────────────────────────────────────────────────── */

const PAGE_SIZE = 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BatchQuery = (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>;

export async function fetchAllRows<T = Record<string, unknown>>(
  buildQuery: BatchQuery
): Promise<T[]> {
  let from = 0;
  let all: T[] = [];

  while (true) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    all = all.concat((data ?? []) as T[]);
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}
