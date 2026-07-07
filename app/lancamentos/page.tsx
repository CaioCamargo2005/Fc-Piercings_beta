"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import ProductCard from "@/app/components/ui/ProductCard";
import { Product } from "@/lib/products-mock";

const ITEMS_PER_PAGE = 12;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const SORT_OPTIONS = [
  { value: "novos",       label: "Mais recentes" },
  { value: "menor_preco", label: "Menor preço"   },
  { value: "maior_preco", label: "Maior preço"   },
];

export default function LancamentosPage() {
  const [sort,     setSort]     = useState("novos");
  const [page,     setPage]     = useState(1);
  const [raw,      setRaw]      = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      const sb = createClient();
      // busca em lotes de 1.000 (teto padrão do PostgREST)
      const data = await fetchAllRows((from, to) =>
        sb
          .from("products")
          .select("*, categories(name,slug), product_images(url,sort_order)")
          .eq("active", true)
          .eq("is_new", true)
          .order("created_at", { ascending: false })
          .range(from, to)
      );

      const now = Date.now();
      const products = (data ?? [])
        .map((p: Record<string, unknown>) => {
          const imgs = [...((p.product_images as { url: string; sort_order: number }[]) ?? [])]
            .sort((a, b) => a.sort_order - b.sort_order).map(i => i.url);
          const cat = p.categories as { name: string; slug: string } | null;
          return {
            id: String(p.id), name: String(p.name), slug: String(p.slug),
            price: Number(p.price), originalPrice: p.original_price ? Number(p.original_price) : undefined,
            category: cat?.name ?? "", subcategory: String(p.subcategory ?? ""),
            material: String(p.material ?? ""), description: String(p.description ?? ""),
            details: (p.details as string[]) ?? [], images: imgs, stock: Number(p.stock),
            sizes: (p.sizes as string[]) ?? undefined, sides: (p.sides as string[]) ?? undefined,
            colors: (p.colors as string[]) ?? undefined,
            featured: Boolean(p.featured), isNew: Boolean(p.is_new),
            onSale: Boolean(p.on_sale), active: Boolean(p.active),
            createdAt: String(p.created_at),
          } as Product;
        })
        // só lançamentos dentro dos 7 dias
        .filter(p => (now - new Date(p.createdAt).getTime()) < SEVEN_DAYS);

      setRaw(products);
      setLoading(false);
    }
    load();
  }, []);

  const products = useMemo(() => {
    const prods = [...raw];
    switch (sort) {
      case "menor_preco": prods.sort((a, b) => a.price - b.price); break;
      case "maior_preco": prods.sort((a, b) => b.price - a.price); break;
      default: prods.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return prods;
  }, [raw, sort]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginated  = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div style={{ background: "var(--white-off)", minHeight: "calc(100vh - 120px)" }}>
      <div className="px-4 sm:px-8" style={{ maxWidth: 1400, margin: "0 auto", paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <Link href="/" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>Início</Link>
          <ChevronRight size={12} style={{ color: "var(--gray-mid)" }} />
          <span style={{ color: "var(--gray-mid)", fontSize: 13 }}>Lançamentos</span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--black)", marginBottom: 4 }}>✨ Lançamentos</h1>
          <div style={{ height: 3, width: 56, background: "linear-gradient(90deg,#8B6914,#C9A84C)", borderRadius: 2, marginBottom: 8 }} />
          <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>
            {products.length} {products.length === 1 ? "novidade" : "novidades"} · Cada lançamento fica em destaque por 7 dias
          </p>
        </div>

        <div style={{ background: "var(--white)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--gray-mid)" }}>Ordenar:</span>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", background: "white", fontSize: 13, outline: "none", cursor: "pointer", color: "var(--black)" }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 12 }}>
            <p style={{ color: "var(--gray-mid)", fontSize: 15 }}>Nenhum lançamento no momento.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 16 }}>
            {paginated.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 32 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", background: "white", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, fontSize: 14 }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", border: page === n ? "none" : "1px solid rgba(0,0,0,0.12)", background: page === n ? "linear-gradient(135deg,#8B6914,#C9A84C)" : "white", color: "var(--black)", fontWeight: page === n ? 700 : 400, fontSize: 13 }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", background: "white", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, fontSize: 14 }}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}
