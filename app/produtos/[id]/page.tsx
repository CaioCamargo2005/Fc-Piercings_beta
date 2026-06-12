"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, ChevronRight, Check, Package, Shield, RotateCcw } from "lucide-react";
import { getBySlug, getAll } from "@/lib/products-mock";
import { useCart } from "@/lib/cart-context";
import ProductCard from "@/app/components/ui/ProductCard";

export default function ProductPage() {
  const params = useParams();
  const slug = typeof params.id === "string" ? params.id : "";
  const product = getBySlug(slug);

  const [selectedSize, setSelectedSize] = useState<string | null>(product?.sizes?.[0] ?? null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "var(--gray-mid)", fontSize: 16 }}>Produto não encontrado.</p>
        <Link href="/" style={{ color: "var(--gold)", fontSize: 14 }}>← Voltar à loja</Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const related = getAll()
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  function handleAddToCart() {
    if (product) addItem(product, qty, selectedSize ?? undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const imgBoxStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #f0efe8, #e8e6dc)",
    borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  };

  return (
    <div style={{ background: "var(--white)", padding: "32px", maxWidth: 1200, margin: "0 auto" }}>

      {/* breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "Início", href: "/" },
          { label: product.category, href: `/categorias/${product.category.toLowerCase().replace(/ /g, "-")}` },
          { label: product.subcategory, href: "#" },
        ].map((b, i, arr) => (
          <span key={b.href} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href={b.href} style={{
              color: i === arr.length - 1 ? "var(--gray-mid)" : "var(--gold)",
              fontSize: 13, textDecoration: "none",
              pointerEvents: i === arr.length - 1 ? "none" : "auto",
            }}>{b.label}</Link>
            {i < arr.length - 1 && <ChevronRight size={12} style={{ color: "var(--gray-mid)" }} />}
          </span>
        ))}
      </div>

      {/* ── GRID PRINCIPAL ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 56 }}>

        {/* FOTOS */}
        <div>
          {/* imagem principal */}
          <div style={{ ...imgBoxStyle, aspectRatio: "1", marginBottom: 12 }}>
            {product.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[activeImage]} alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 64 }}>💍</span>
                <p style={{ color: "var(--gray-mid)", fontSize: 12, marginTop: 8 }}>Foto em breve</p>
              </div>
            )}
          </div>
          {/* thumbnails — só se tiver múltiplas fotos */}
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  style={{
                    width: 64, height: 64, borderRadius: 8, overflow: "hidden", padding: 0, border: "none",
                    outline: activeImage === i ? "2px solid var(--gold)" : "2px solid transparent",
                    cursor: "pointer", flexShrink: 0,
                  }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETALHES */}
        <div>
          {/* badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {discount && (
              <span style={{ background: "#e05555", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>
                {discount}% OFF
              </span>
            )}
            {product.isNew && (
              <span style={{ background: "linear-gradient(135deg,#8B6914,#C9A84C)", color: "var(--black)", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>
                NOVO
              </span>
            )}
            <span style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>
              {product.material}
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--black)", lineHeight: 1.25, marginBottom: 16 }}>
            {product.name}
          </h1>

          {/* preço */}
          <div style={{ marginBottom: 20 }}>
            {product.originalPrice && (
              <p style={{ color: "var(--gray-mid)", fontSize: 14, textDecoration: "line-through" }}>
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </p>
            )}
            <p style={{
              fontSize: 32, fontWeight: 800,
              background: "linear-gradient(135deg,#8B6914,#C9A84C)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              lineHeight: 1,
            }}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
            <p style={{ color: "var(--gray-mid)", fontSize: 12, marginTop: 4 }}>
              ou 3x de R$ {(product.price / 3).toFixed(2).replace(".", ",")} sem juros
            </p>
          </div>

          {/* tamanhos */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "var(--black)", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                Tamanho: <span style={{ color: "var(--gold)" }}>{selectedSize}</span>
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    style={{
                      padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s",
                      background: selectedSize === size ? "linear-gradient(135deg,#8B6914,#C9A84C)" : "transparent",
                      color: selectedSize === size ? "var(--black)" : "var(--gray-mid)",
                      border: selectedSize === size ? "none" : "1px solid rgba(0,0,0,0.15)",
                    }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* quantidade */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "var(--black)", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Quantidade</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, overflow: "hidden" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{ width: 36, height: 36, border: "none", background: "#f5f5f0", cursor: "pointer", fontSize: 18, color: "var(--gray-mid)" }}>
                  −
                </button>
                <span style={{ width: 40, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  style={{ width: 36, height: 36, border: "none", background: "#f5f5f0", cursor: "pointer", fontSize: 18, color: "var(--gray-mid)" }}>
                  +
                </button>
              </div>
              <p style={{ color: "var(--gray-mid)", fontSize: 12 }}>
                {product.stock > 0 ? `${product.stock} disponíveis` : "Fora de estoque"}
              </p>
            </div>
          </div>

          {/* botões de ação */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <button onClick={handleAddToCart} className="btn-gold"
              disabled={product.stock === 0}
              style={{
                flex: 1, padding: "13px", borderRadius: 10, border: "none",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: product.stock === 0 ? 0.5 : 1,
              }}>
              {addedToCart ? <><Check size={16} /> Adicionado!</> : <><ShoppingCart size={16} /> Adicionar ao carrinho</>}
            </button>
            <button style={{
              width: 48, height: 48, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)",
              background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Heart size={18} style={{ color: "var(--gray-mid)" }} />
            </button>
          </div>

          {/* comprar via whatsapp */}
          <a href={`https://wa.me/5519997103023?text=Olá! Tenho interesse no produto: ${encodeURIComponent(product.name)} (R$ ${product.price.toFixed(2).replace(".", ",")})`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "12px", borderRadius: 10,
              border: "1px solid rgba(37,211,102,0.3)", color: "#25D366",
              background: "rgba(37,211,102,0.06)", textDecoration: "none",
              fontSize: 14, fontWeight: 600, marginBottom: 24,
            }}>
            💬 Comprar via WhatsApp
          </a>

          {/* garantias */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, background: "#f9f8f4", borderRadius: 10 }}>
            {[
              { icon: <Shield size={15} />, text: "Garantia de 1 ano contra manchas e deformações" },
              { icon: <Package size={15} />, text: "Entrega para todo o Brasil — SEDEX e PAC" },
              { icon: <RotateCcw size={15} />, text: "Troca em até 7 dias após o recebimento" },
            ].map((g, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--gray-mid)", fontSize: 13 }}>
                <span style={{ color: "var(--gold)", flexShrink: 0 }}>{g.icon}</span>
                {g.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESCRIÇÃO + DETALHES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 56 }}>
        <div style={{ padding: 24, background: "#f9f8f4", borderRadius: 12 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--black)", marginBottom: 12 }}>
            Descrição
          </h3>
          <p style={{ color: "var(--gray-mid)", fontSize: 14, lineHeight: 1.8 }}>{product.description}</p>
        </div>
        <div style={{ padding: 24, background: "#f9f8f4", borderRadius: 12 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--black)", marginBottom: 12 }}>
            Características
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {product.details.map((d, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, color: "var(--gray-mid)", fontSize: 14 }}>
                <Check size={14} style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }} />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── PRODUTOS RELACIONADOS ── */}
      {related.length > 0 && (
        <section>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--black)" }}>
              Produtos Relacionados
            </h2>
            <div style={{ height: 2, width: 40, background: "linear-gradient(90deg,#8B6914,#C9A84C)", borderRadius: 1, marginTop: 6 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
