"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "./components/ui/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/products-mock";

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
      <div style={{ background: "var(--black-soft)", borderBottom: "2px solid rgba(201,168,76,0.2)", padding: "64px 32px", textAlign: "center" }}>
        <p style={{ color: "var(--gray-mid)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Bem-vinda à</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 900, lineHeight: 1.1, background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C,#8B6914)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 16 }}>
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
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
          {["🚚 Entrega para todo Brasil","✅ Titânio certificado ASTM F136","🔒 Compra 100% segura","⭐ Garantia de 1 ano"].map(b => (
            <span key={b} style={{ color: "var(--gray-mid)", fontSize: 13 }}>{b}</span>
          ))}
        </div>
      </div>

      {/* SEÇÕES */}
      <div style={{ padding: "48px 32px", maxWidth: 1400, margin: "0 auto" }}>
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
            {newProducts.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <SectionHeader title="Lançamentos" href="/lancamentos" />
                <ProductGrid products={newProducts} />
              </section>
            )}

            {featured.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <SectionHeader title="Destaques" href="/categorias/titanio-natural" />
                <ProductGrid products={featured} />
              </section>
            )}

            {/* banners de categoria */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 56 }}>
              {[
                { label: "Joias em", bold: "Titânio", href: "/categorias/titanio-natural", emoji: "🥈" },
                { label: "Joias em", bold: "Aço PVD Gold", href: "/categorias/aco-pvd-gold", emoji: "✨" },
              ].map(b => (
                <Link key={b.href} href={b.href} style={{
                  background: "var(--black-soft)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12,
                  padding: "32px 28px", textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)")}
                >
                  <div>
                    <p style={{ color: "var(--gray-light)", fontSize: 14, marginBottom: 4 }}>{b.label}</p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{b.bold}</p>
                    <p style={{ color: "var(--gold)", fontSize: 13, marginTop: 10 }}>Confira →</p>
                  </div>
                  <span style={{ fontSize: 48, opacity: 0.5 }}>{b.emoji}</span>
                </Link>
              ))}
            </div>

            {onSale.length > 0 && (
              <section style={{ marginBottom: 56 }}>
                <SectionHeader title="Ofertas da Semana" href="/ofertas" />
                <ProductGrid products={onSale} />
              </section>
            )}

            {/* Se não tiver nenhuma flag marcada, mostra todos */}
            {newProducts.length === 0 && featured.length === 0 && onSale.length === 0 && allProds.length > 0 && (
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
