"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/app/components/ui/ProductCard";
import { Product } from "@/lib/products-mock";

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: "maior_desconto", label: "Maior desconto" },
  { value: "menor_preco",    label: "Menor preço"    },
  { value: "maior_preco",    label: "Maior preço"    },
  { value: "expirando",      label: "Expirando em breve" },
];

type ProductWithExpiry = Product & { saleEndsAt?: string | null };

export default function OfertasPage() {
  const [sort,     setSort]     = useState("maior_desconto");
  const [page,     setPage]     = useState(1);
  const [minDesc,  setMinDesc]  = useState(0);
  const [raw,      setRaw]      = useState<ProductWithExpiry[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      const sb = createClient();
      const { data } = await sb
        .from("products")
        .select("*, categories(name,slug), product_images(url,sort_order)")
        .eq("active", true)
        .eq("on_sale", true)
        .order("created_at", { ascending: false });

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
            saleEndsAt: p.sale_ends_at as string | null,
          } as ProductWithExpiry;
        })
        // remove ofertas expiradas
        .filter(p => !p.saleEndsAt || new Date(p.saleEndsAt).getTime() > now);

      setRaw(products);
      setLoading(false);
    }
    load();
  }, []);

  const products = useMemo(() => {
    let prods = [...raw];
    if (minDesc > 0) {
      prods = prods.filter(p => {
        if (!p.originalPrice) return false;
        const pct = Math.round((1 - p.price / p.originalPrice) * 100);
        return pct >= minDesc;
      });
    }
    switch (sort) {
      case "maior_desconto":
        prods.sort((a, b) => {
          const da = a.originalPrice ? (1 - a.price / a.originalPrice) : 0;
          const db = b.originalPrice ? (1 - b.price / b.originalPrice) : 0;
          return db - da;
        });
        break;
      case "menor_preco": prods.sort((a, b) => a.price - b.price); break;
      case "maior_preco": prods.sort((a, b) => b.price - a.price); break;
      case "expirando":
        prods.sort((a, b) => {
          if (!a.saleEndsAt) return 1;
          if (!b.saleEndsAt) return -1;
          return new Date(a.saleEndsAt).getTime() - new Date(b.saleEndsAt).getTime();
        });
        break;
    }
    return prods;
  }, [raw, sort, minDesc]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginated  = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const DISC_FILTERS = [
    { label: "Qualquer desconto", value: 0  },
    { label: "10% ou mais",       value: 10 },
    { label: "20% ou mais",       value: 20 },
    { label: "30% ou mais",       value: 30 },
    { label: "50% ou mais",       value: 50 },
  ];

  function timeLeft(endsAt: string): string {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return "Expirando...";
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h restantes`;
    return `${hours}h restantes`;
  }

  return (
    <div style={{ background: "var(--white-off)", minHeight: "calc(100vh - 120px)" }}>
      <div className="px-4 sm:px-8" style={{ maxWidth: 1400, margin: "0 auto", paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <Link href="/" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>Início</Link>
          <ChevronRight size={12} style={{ color: "var(--gray-mid)" }} />
          <span style={{ color: "var(--gray-mid)", fontSize: 13 }}>Ofertas</span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--black)", marginBottom: 4 }}>🔥 Ofertas da Semana</h1>
          <div style={{ height: 3, width: 56, background: "linear-gradient(90deg,#8B6914,#C9A84C)", borderRadius: 2, marginBottom: 8 }} />
          <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>
            {products.length} {products.length === 1 ? "produto com desconto" : "produtos com desconto"}
          </p>
        </div>

        <div style={{ background: "var(--white)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--gray-mid)", fontWeight: 600, whiteSpace: "nowrap" }}>Desconto mínimo:</span>
            {DISC_FILTERS.map(f => (
              <button key={f.value} onClick={() => { setMinDesc(f.value); setPage(1); }}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: `1px solid ${minDesc === f.value ? "var(--gold)" : "rgba(0,0,0,0.12)"}`, background: minDesc === f.value ? "rgba(201,168,76,0.1)" : "transparent", color: minDesc === f.value ? "var(--gold)" : "var(--gray-mid)", fontWeight: minDesc === f.value ? 600 : 400 }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--gray-mid)", whiteSpace: "nowrap" }}>Ordenar:</span>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", background: "white", fontSize: 13, outline: "none", cursor: "pointer", color: "var(--black)" }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 12 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>😕</p>
            <p style={{ color: "var(--gray-mid)", fontSize: 15, marginBottom: 8 }}>Nenhuma oferta com esse desconto no momento.</p>
            <button onClick={() => setMinDesc(0)} style={{ color: "var(--gold)", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>Ver todas as ofertas</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 16 }}>
            {paginated.map(p => (
              <div key={p.id}>
                <ProductCard product={p} />
                {p.saleEndsAt && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, padding: "4px 8px", background: "rgba(224,85,85,0.08)", borderRadius: 6, justifyContent: "center" }}>
                    <Clock size={11} style={{ color: "#e05555" }} />
                    <span style={{ fontSize: 11, color: "#e05555", fontWeight: 600 }}>{timeLeft(p.saleEndsAt)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 32 }}>
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
