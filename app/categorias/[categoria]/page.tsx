"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import ProductCard from "@/app/components/ui/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { Product } from "@/lib/products-mock";

const ITEMS_PER_PAGE = 12;

const PRICE_RANGES = [
  { label: "Até R$ 30",       min: 0,   max: 30   },
  { label: "R$ 30 a R$ 60",   min: 30,  max: 60   },
  { label: "R$ 60 a R$ 100",  min: 60,  max: 100  },
  { label: "R$ 100 a R$ 200", min: 100, max: 200  },
  { label: "Acima de R$ 200", min: 200, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevância"    },
  { value: "menor",      label: "Menor preço"   },
  { value: "maior",      label: "Maior preço"   },
  { value: "novos",      label: "Mais recentes" },
  { value: "desconto",   label: "Maior desconto"},
];

const CATEGORY_LABELS: Record<string, string> = {
  "titanio-natural":   "Titânio Natural",
  "titanio-pvd-gold":  "Titânio PVD Gold",
  "titanio-pvd-black": "Titânio PVD Black",
  "aco-natural":       "Aço Natural",
  "aco-pvd-gold":      "Aço PVD Gold",
  "aco-pvd-black":     "Aço PVD Black",
  "ofertas":           "Ofertas da Semana",
  "lancamentos":       "Lançamentos",
  "destaques":         "Destaques",
};

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", paddingBottom: 16, marginBottom: 16 }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginBottom: open ? 12 : 0 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--black)" }}>{title}</span>
        {open ? <ChevronUp size={14} style={{ color: "var(--gray-mid)" }} /> : <ChevronDown size={14} style={{ color: "var(--gray-mid)" }} />}
      </button>
      {open && children}
    </div>
  );
}

function CategoriaContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug     = typeof params.categoria === "string" ? params.categoria : "";
  const subFromUrl = decodeURIComponent(searchParams.get("sub") ?? "");

  const [allProducts,    setAllProducts]    = useState<Product[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedSubs,   setSelectedSubs]   = useState<string[]>(subFromUrl ? [subFromUrl] : []);
  const [selectedPrices, setSelectedPrices] = useState<number[]>([]);
  const [selectedSizes,  setSelectedSizes]  = useState<string[]>([]);
  const [onSaleOnly,     setOnSaleOnly]     = useState(false);
  const [newOnly,        setNewOnly]        = useState(false);
  const [sort,           setSort]           = useState("relevancia");
  const [page,           setPage]           = useState(1);
  const [mobileFilters,  setMobileFilters]  = useState(false);

  const catLabel = CATEGORY_LABELS[slug] ?? slug.replace(/-/g, " ");

  // Sync ?sub= param when URL changes
  useEffect(() => {
    setSelectedSubs(subFromUrl ? [subFromUrl] : []);
    setPage(1);
  }, [subFromUrl]);

  // Load products from Supabase
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const sb = createClient();

        // resolve o id da categoria uma vez só (fora do loop de lotes)
        let categoryId: string | null = null;
        if (slug !== "ofertas" && slug !== "lancamentos" && slug !== "destaques") {
          const { data: cat } = await sb.from("categories").select("id").eq("slug", slug).single();
          if (cat && "id" in cat) categoryId = (cat as { id: string }).id;
        }

        // busca em lotes de 1.000 — PostgREST trunca queries maiores silenciosamente
        const data = await fetchAllRows((from, to) => {
          let query = sb
            .from("products")
            .select("*, categories(name,slug), product_images(url,sort_order)")
            .eq("active", true);

          if (slug === "ofertas")          query = query.eq("on_sale", true);
          else if (slug === "lancamentos") query = query.eq("is_new", true);
          else if (slug === "destaques")   query = query.eq("featured", true);
          else if (categoryId)             query = query.eq("category_id", categoryId);

          return query.order("created_at", { ascending: false }).range(from, to);
        });

        const products = (data ?? []).map((p: Record<string, unknown>) => {
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
            featured: Boolean(p.featured), isNew: Boolean(p.is_new),
            onSale: Boolean(p.on_sale), active: Boolean(p.active),
            createdAt: String(p.created_at),
          } as Product;
        });
        setAllProducts(products);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const subcategories = [...new Set(allProducts.map(p => p.subcategory))].filter(Boolean);
  const allSizes      = [...new Set(allProducts.flatMap(p => p.sizes ?? []))].sort();

  const filtered = useMemo(() => {
    let prods = [...allProducts];
    if (selectedSubs.length)   prods = prods.filter(p => selectedSubs.includes(p.subcategory));
    if (selectedPrices.length) {
      const ranges = PRICE_RANGES.filter((_, i) => selectedPrices.includes(i));
      prods = prods.filter(p => ranges.some(r => p.price >= r.min && p.price < r.max));
    }
    if (selectedSizes.length)  prods = prods.filter(p => (p.sizes ?? []).some(s => selectedSizes.includes(s)));
    if (onSaleOnly) prods = prods.filter(p => p.onSale);
    if (newOnly)    prods = prods.filter(p => p.isNew);
    switch (sort) {
      case "menor":   prods.sort((a, b) => a.price - b.price); break;
      case "maior":   prods.sort((a, b) => b.price - a.price); break;
      case "novos":   prods.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case "desconto":
        prods.sort((a, b) => {
          const da = a.originalPrice ? (1 - a.price / a.originalPrice) : 0;
          const db = b.originalPrice ? (1 - b.price / b.originalPrice) : 0;
          return db - da;
        });
        break;
    }
    return prods;
  }, [allProducts, selectedSubs, selectedPrices, selectedSizes, onSaleOnly, newOnly, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function toggleSub(sub: string)   { setSelectedSubs(p => p.includes(sub) ? p.filter(s => s !== sub) : [...p, sub]); setPage(1); }
  function togglePrice(i: number)   { setSelectedPrices(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]); setPage(1); }
  function toggleSize(s: string)    { setSelectedSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]); setPage(1); }
  function clearAll() { setSelectedSubs([]); setSelectedPrices([]); setSelectedSizes([]); setOnSaleOnly(false); setNewOnly(false); setPage(1); }

  const hasFilters = selectedSubs.length || selectedPrices.length || selectedSizes.length || onSaleOnly || newOnly;

  const checkRow = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "5px 0",
    cursor: "pointer", fontSize: 13,
    color: active ? "var(--black)" : "var(--gray-mid)", fontWeight: active ? 600 : 400,
  });

  function FiltersPanel() {
    return (
      <div>
        {subcategories.length > 0 && (
          <FilterSection title="Subcategoria">
            {subcategories.map(sub => (
              <label key={sub} style={checkRow(selectedSubs.includes(sub))}>
                <input type="checkbox" checked={selectedSubs.includes(sub)} onChange={() => toggleSub(sub)} style={{ accentColor: "var(--gold)", cursor: "pointer" }} />
                {sub}
              </label>
            ))}
          </FilterSection>
        )}
        <FilterSection title="Preço">
          {PRICE_RANGES.map((r, i) => (
            <label key={i} style={checkRow(selectedPrices.includes(i))}>
              <input type="checkbox" checked={selectedPrices.includes(i)} onChange={() => togglePrice(i)} style={{ accentColor: "var(--gold)", cursor: "pointer" }} />
              {r.label}
            </label>
          ))}
        </FilterSection>
        {allSizes.length > 0 && (
          <FilterSection title="Tamanho">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {allSizes.map(s => (
                <button key={s} onClick={() => toggleSize(s)}
                  style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: `1px solid ${selectedSizes.includes(s) ? "var(--gold)" : "rgba(0,0,0,0.12)"}`, background: selectedSizes.includes(s) ? "rgba(201,168,76,0.1)" : "transparent", color: selectedSizes.includes(s) ? "var(--gold)" : "var(--gray-mid)", fontWeight: selectedSizes.includes(s) ? 600 : 400 }}>
                  {s}
                </button>
              ))}
            </div>
          </FilterSection>
        )}
        <FilterSection title="Filtros Especiais" defaultOpen={false}>
          <label style={checkRow(onSaleOnly)}><input type="checkbox" checked={onSaleOnly} onChange={e => { setOnSaleOnly(e.target.checked); setPage(1); }} style={{ accentColor: "var(--gold)", cursor: "pointer" }} />Somente ofertas</label>
          <label style={checkRow(newOnly)}><input type="checkbox" checked={newOnly} onChange={e => { setNewOnly(e.target.checked); setPage(1); }} style={{ accentColor: "var(--gold)", cursor: "pointer" }} />Somente lançamentos</label>
        </FilterSection>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--white-off)", minHeight: "calc(100vh - 120px)" }}>
      <div className="px-4 sm:px-8" style={{ maxWidth: 1400, margin: "0 auto", paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <Link href="/" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>Início</Link>
          <ChevronRight size={12} style={{ color: "var(--gray-mid)" }} />
          <span style={{ color: "var(--gray-mid)", fontSize: 13 }}>{catLabel}</span>
          {subFromUrl && <><ChevronRight size={12} style={{ color: "var(--gray-mid)" }} /><span style={{ color: "var(--gray-mid)", fontSize: 13 }}>{subFromUrl}</span></>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]" style={{ gap: 24, alignItems: "start" }}>
          {/* sidebar — só aparece no desktop, mobile usa o drawer */}
          <aside className="hidden lg:block" style={{ background: "var(--white)", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12, padding: "20px 16px", position: "sticky", top: 90 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--black)" }}>Filtros</p>
              {hasFilters && <button onClick={clearAll} style={{ background: "none", border: "none", cursor: "pointer", color: "#e05555", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><X size={12} />Limpar</button>}
            </div>
            <FiltersPanel />
          </aside>

          {/* conteúdo */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--black)", marginBottom: 2 }}>
                  {catLabel}{subFromUrl ? ` — ${subFromUrl}` : ""}
                </h1>
                <p style={{ color: "var(--gray-mid)", fontSize: 13 }}>
                  {loading ? "Carregando..." : `${filtered.length} produto${filtered.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setMobileFilters(true)} className="lg:hidden"
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", background: "white", fontSize: 13, cursor: "pointer", color: "var(--black)" }}>
                  <SlidersHorizontal size={14} />Filtros
                </button>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", background: "white", fontSize: 13, outline: "none", cursor: "pointer", color: "var(--black)" }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* tags de filtros ativos */}
            {hasFilters && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {selectedSubs.map(s => (
                  <span key={s} onClick={() => toggleSub(s)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, fontSize: 12, color: "var(--gold)", cursor: "pointer" }}>
                    {s} <X size={10} />
                  </span>
                ))}
                {selectedPrices.map(i => (
                  <span key={i} onClick={() => togglePrice(i)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, fontSize: 12, color: "var(--gold)", cursor: "pointer" }}>
                    {PRICE_RANGES[i].label} <X size={10} />
                  </span>
                ))}
                {selectedSizes.map(s => (
                  <span key={s} onClick={() => toggleSize(s)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, fontSize: 12, color: "var(--gold)", cursor: "pointer" }}>
                    {s} <X size={10} />
                  </span>
                ))}
              </div>
            )}

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : paginated.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 12 }}>
                <p style={{ color: "var(--gray-mid)", fontSize: 15, marginBottom: 8 }}>Nenhum produto encontrado.</p>
                {hasFilters && <button onClick={clearAll} style={{ color: "var(--gold)", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>Limpar filtros</button>}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 16 }}>
                {paginated.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* paginação */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 32 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", background: "white", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, fontSize: 14 }}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | "...")[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i-1] as number) > 1) acc.push("...");
                    acc.push(n); return acc;
                  }, [])
                  .map((n, i) => n === "..." ? (
                    <span key={`d${i}`} style={{ color: "var(--gray-mid)", padding: "0 4px" }}>…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n as number)}
                      style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", border: page === n ? "none" : "1px solid rgba(0,0,0,0.12)", background: page === n ? "linear-gradient(135deg,#8B6914,#C9A84C)" : "white", color: "var(--black)", fontWeight: page === n ? 700 : 400, fontSize: 13 }}>
                      {n}
                    </button>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)", background: "white", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, fontSize: 14 }}>›</button>
              </div>
            )}

            {filtered.length > 0 && (
              <p style={{ textAlign: "center", color: "var(--gray-mid)", fontSize: 12, marginTop: 12 }}>
                Mostrando {Math.min((page-1)*ITEMS_PER_PAGE+1, filtered.length)}–{Math.min(page*ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* drawer mobile */}
      {mobileFilters && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileFilters(false)} />
          <div style={{ width: 300, background: "white", overflowY: "auto", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Filtros</p>
              <button onClick={() => setMobileFilters(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <FiltersPanel />
            <button onClick={() => setMobileFilters(false)} className="btn-gold"
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
              Ver {filtered.length} produtos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoriaPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <CategoriaContent />
    </Suspense>
  );
}
