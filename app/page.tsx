"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "./components/ui/ProductCard";
import ProductSlider from "./components/ui/ProductSlider";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/products-mock";

/* embaralha um array sem mutar o original (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type DBProduct = {
  id: string; name: string; slug: string;
  price: number; original_price: number | null;
  category_id: string; subcategory: string | null;
  material: string | null; description: string | null;
  details: string[] | null; stock: number;
  sizes: string[] | null; sides: string[] | null; sale_ends_at: string | null;
  featured: boolean; is_new: boolean; on_sale: boolean; active: boolean;
  created_at: string;
  categories: { name: string; slug: string } | null;
  product_images: { url: string; sort_order: number }[];
};

function toProduct(p: DBProduct): Product {
  const images = [...(p.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(i => i.url);
  return {
    id: p.id, name: p.name, slug: p.slug,
    price: p.price, originalPrice: p.original_price ?? undefined,
    category: p.categories?.name ?? "",
    subcategory: p.subcategory ?? "",
    material: p.material ?? "",
    description: p.description ?? "",
    details: p.details ?? [],
    images, stock: p.stock,
    sizes: p.sizes ?? undefined,
    sides: p.sides ?? undefined,
    featured: p.featured, isNew: p.is_new,
    onSale: p.on_sale, active: p.active,
    createdAt: p.created_at,
    saleEndsAt: p.sale_ends_at,
  } as Product & { saleEndsAt: string | null };
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--black)", marginBottom: 6 }}>{title}</h2>
        <div style={{ height: 2, width: 40, background: "linear-gradient(90deg,#8B6914,#C9A84C)", borderRadius: 1 }} />
      </div>
      <Link href={href} style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--gold)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
        Ver todos <ChevronRight size={14} />
      </Link>
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background: "#f0efe8", borderRadius: 12, aspectRatio: "3/4", animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

export default function Home() {
  const [newProducts,  setNewProducts]  = useState<Product[]>([]);
  const [featured,     setFeatured]     = useState<Product[]>([]);
  const [onSale,       setOnSale]       = useState<Product[]>([]);
  const [allProds,     setAllProds]     = useState<Product[]>([]);
  const [suggestions,  setSuggestions]  = useState<Product[]>([]);
  const [categorySamples, setCategorySamples] = useState<{ name: string; slug: string; products: Product[] }[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [hasProducts,  setHasProducts]  = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient();
        const { data, error } = await sb
          .from("products")
          .select("*, categories(name,slug), product_images(url,sort_order)")
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        const all = (data as DBProduct[] ?? []).map(toProduct);

        if (all.length === 0) {
          setHasProducts(false);
        } else {
          const now = Date.now();
          const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

          // lançamento expira 7 dias após criado
          const stillNew = all.filter(p => p.isNew && (now - new Date(p.createdAt).getTime()) < SEVEN_DAYS);

          // oferta expira em sale_ends_at, se definido
          const stillOnSale = all.filter(p => {
            if (!p.onSale) return false;
            const endsAt = (p as Product & { saleEndsAt?: string | null }).saleEndsAt;
            if (!endsAt) return true; // sem prazo definido = sempre ativo
            return new Date(endsAt).getTime() > now;
          });

          setAllProds(all.slice(0, 8));
          setNewProducts(stillNew.slice(0, 8));
          setFeatured(all.filter(p => p.featured).slice(0, 8));
          setOnSale(stillOnSale.slice(0, 8));

          // ── Sugestões para você — aleatório a cada carregamento da página ──
          setSuggestions(shuffle(all).slice(0, 10));

          // ── Sample de cada categoria — 7-8 produtos aleatórios por categoria ──
          const byCategory = new Map<string, Product[]>();
          all.forEach(p => {
            if (!p.category) return;
            if (!byCategory.has(p.category)) byCategory.set(p.category, []);
            byCategory.get(p.category)!.push(p);
          });

          const samples = [...byCategory.entries()]
            .filter(([, prods]) => prods.length > 0)
            .map(([name, prods]) => ({
              name,
              slug: name.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "-"),
              products: shuffle(prods).slice(0, 8),
            }));

          setCategorySamples(shuffle(samples));
        }
      } catch (e) {
        console.error("Erro ao carregar produtos:", e);
        setHasProducts(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ background: "var(--white)" }}>
      {/* HERO */}
      <div className="px-4 sm:px-8" style={{ background: "var(--black-soft)", borderBottom: "2px solid rgba(201,168,76,0.2)", paddingTop: 48, paddingBottom: 48, textAlign: "center" }}>
        <p style={{ color: "var(--gray-mid)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Bem-vinda à</p>
        <h1 className="text-[32px] sm:text-[42px]" style={{ fontFamily: "var(--font-display)", fontWeight: 900, lineHeight: 1.1, background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C,#8B6914)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 16 }}>
          FC Piercing<br />e Semi Joias
        </h1>
        <p style={{ color: "var(--gray-mid)", fontSize: 15, marginBottom: 28 }}>
          Titânio cirúrgico, aço PVD Gold e semi joias com garantia de 1 ano
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/categorias/titanio-natural" className="btn-gold"
            style={{ padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Ver catálogo
          </Link>
          <a href="https://wa.me/5519997103023" target="_blank" rel="noopener noreferrer"
            style={{ padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "1px solid rgba(37,211,102,0.4)", color: "#25D366", background: "rgba(37,211,102,0.08)", textDecoration: "none" }}>
            💬 Falar no WhatsApp
          </a>
        </div>
        <div className="gap-3 sm:gap-8" style={{ display: "flex", justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          {["🚚 Entrega para todo Brasil","✅ Titânio certificado ASTM F136","🔒 Compra 100% segura","⭐ Garantia de 1 ano"].map(b => (
            <span key={b} style={{ color: "var(--gray-mid)", fontSize: 13 }}>{b}</span>
          ))}
        </div>
      </div>

      {/* SEÇÕES */}
      <div className="px-4 sm:px-8" style={{ paddingTop: 40, paddingBottom: 40, maxWidth: 1400, margin: "0 auto" }}>
        {loading ? (
          <>
            <div style={{ marginBottom: 56 }}>
              <div style={{ height: 32, width: 180, background: "#f0efe8", borderRadius: 8, marginBottom: 24 }} />
              <Skeleton />
            </div>
          </>
        ) : !hasProducts ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray-mid)" }}>
            <p style={{ fontSize: 15 }}>Nenhum produto cadastrado ainda.</p>
            <Link href="/admin" style={{ color: "var(--gold)", fontSize: 14, marginTop: 8, display: "inline-block" }}>
              Ir para o painel admin →
            </Link>
          </div>
        ) : (
          <>
            {/* ── SUGESTÕES PARA VOCÊ — aleatório a cada visita ── */}
            {suggestions.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <SectionHeader title="Sugestões para você" href="/categorias/titanio-natural" />
                <ProductSlider products={suggestions} seeMoreHref="/categorias/titanio-natural" />
              </section>
            )}

            {newProducts.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <SectionHeader title="Lançamentos" href="/lancamentos" />
                <ProductSlider products={newProducts} seeMoreHref="/lancamentos" />
              </section>
            )}

            {featured.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <SectionHeader title="Destaques" href="/categorias/titanio-natural" />
                <ProductSlider products={featured} seeMoreHref="/categorias/titanio-natural" />
              </section>
            )}

            {/* banners de categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 56 }}>
              {[
                { label: "Joias em", bold: "Titânio", href: "/categorias/titanio-natural", emoji: "🥈" },
                { label: "Joias em", bold: "Aço PVD Gold", href: "/categorias/aco-pvd-gold", emoji: "✨" },
              ].map(b => (
                <Link key={b.href} href={b.href} style={{
                  background: "var(--black-soft)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12,
                  padding: "28px 24px", textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)")}
                >
                  <div>
                    <p style={{ color: "var(--gray-light)", fontSize: 14, marginBottom: 4 }}>{b.label}</p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{b.bold}</p>
                    <p style={{ color: "var(--gold)", fontSize: 13, marginTop: 10 }}>Confira →</p>
                  </div>
                  <span style={{ fontSize: 40, opacity: 0.5, flexShrink: 0, marginLeft: 12 }}>{b.emoji}</span>
                </Link>
              ))}
            </div>

            {onSale.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <SectionHeader title="Ofertas da Semana" href="/ofertas" />
                <ProductSlider products={onSale} seeMoreHref="/ofertas" />
              </section>
            )}

            {/* ── UM SLIDER POR CATEGORIA — amostra aleatória de cada uma ── */}
            {categorySamples.map(cat => (
              <section key={cat.slug} style={{ marginBottom: 56 }}>
                <SectionHeader title={cat.name} href={`/categorias/${cat.slug}`} />
                <ProductSlider products={cat.products} seeMoreHref={`/categorias/${cat.slug}`} />
              </section>
            ))}

            {/* Se não tiver nenhuma flag marcada, mostra todos */}
            {newProducts.length === 0 && featured.length === 0 && onSale.length === 0 && categorySamples.length === 0 && allProds.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <SectionHeader title="Produtos" href="/categorias/titanio-natural" />
                <ProductGrid products={allProds} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
