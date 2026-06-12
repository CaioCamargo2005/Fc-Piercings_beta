"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "./components/ui/ProductCard";
import { getFeatured, getNew, getOnSale, Product } from "@/lib/products-mock";

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
          background: "linear-gradient(135deg,#0A0A0A,#1A1A1A)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>{title}</h2>
        <div style={{ height: 2, width: 40, background: "linear-gradient(90deg,#8B6914,#C9A84C)", borderRadius: 1, marginTop: 6 }} />
      </div>
      <Link href={href} style={{
        display: "flex", alignItems: "center", gap: 4,
        color: "var(--gold)", fontSize: 13, fontWeight: 500, textDecoration: "none",
      }}>
        Ver todos <ChevronRight size={14} />
      </Link>
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 16,
    }}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={(prod) => console.log("add to cart:", prod.name)} />
      ))}
    </div>
  );
}

export default function Home() {
  const featured = getFeatured();
  const newProducts = getNew();
  const onSale = getOnSale();

  return (
    <div style={{ background: "var(--white)" }}>

      {/* ── HERO BANNER placeholder ── */}
      <div style={{
        background: "var(--black-soft)",
        borderBottom: "2px solid rgba(201,168,76,0.2)",
        padding: "64px 32px",
        textAlign: "center",
      }}>
        <p style={{ color: "var(--gray-mid)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
          Bem-vinda à
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 900, lineHeight: 1.1,
          background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C,#8B6914)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          marginBottom: 16,
        }}>
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
            style={{
              padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: "1px solid rgba(37,211,102,0.4)", color: "#25D366",
              background: "rgba(37,211,102,0.08)", textDecoration: "none",
            }}>
            💬 Falar no WhatsApp
          </a>
        </div>

        {/* badges de confiança */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
          {[
            { icon: "🚚", text: "Entrega para todo Brasil" },
            { icon: "✅", text: "Titânio certificado ASTM F136" },
            { icon: "🔒", text: "Compra 100% segura" },
            { icon: "⭐", text: "Garantia de 1 ano" },
          ].map((b) => (
            <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gray-mid)", fontSize: 13 }}>
              <span>{b.icon}</span>{b.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── SEÇÕES DE PRODUTOS ── */}
      <div style={{ padding: "48px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* Lançamentos */}
        {newProducts.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <SectionHeader title="Lançamentos" href="/lancamentos" />
            <ProductGrid products={newProducts} />
          </section>
        )}

        {/* Destaques */}
        {featured.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <SectionHeader title="Destaques" href="/destaques" />
            <ProductGrid products={featured} />
          </section>
        )}

        {/* Banners de categoria */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 56 }}>
          {[
            { label: "Joias em", bold: "Titânio", href: "/categorias/titanio-natural", emoji: "🥈" },
            { label: "Joias em", bold: "Aço PVD Gold", href: "/categorias/aco-pvd-gold", emoji: "✨" },
          ].map((b) => (
            <Link key={b.href} href={b.href} style={{
              background: "var(--black-soft)",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: 12, padding: "32px 28px",
              textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gold)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,168,76,0.2)")}
            >
              <div>
                <p style={{ color: "var(--gray-light)", fontSize: 14, marginBottom: 4 }}>{b.label}</p>
                <p style={{
                  fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700,
                  background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>{b.bold}</p>
                <p style={{ color: "var(--gold)", fontSize: 13, marginTop: 10 }}>Confira →</p>
              </div>
              <span style={{ fontSize: 48, opacity: 0.5 }}>{b.emoji}</span>
            </Link>
          ))}
        </div>

        {/* Ofertas */}
        {onSale.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <SectionHeader title="Ofertas da Semana" href="/ofertas" />
            <ProductGrid products={onSale} />
          </section>
        )}
      </div>
    </div>
  );
}
