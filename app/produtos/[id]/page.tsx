"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingCart, Heart, ChevronRight, Check, Package, Shield, RotateCcw, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/app/components/ui/ProductCard";
import { Product } from "@/lib/products-mock";

type DBProduct = {
  id: string; name: string; slug: string;
  price: number; original_price: number | null;
  category_id: string; subcategory: string | null;
  material: string | null; description: string | null;
  details: string[] | null; stock: number;
  sizes: string[] | null; sides: string[] | null;
  colors: string[] | null; sale_ends_at: string | null;
  featured: boolean; is_new: boolean; on_sale: boolean; active: boolean;
  created_at: string;
  categories: { name: string; slug: string } | null;
  product_images: { id: string; url: string; sort_order: number }[];
};

function toProduct(p: DBProduct): Product {
  const images = [...(p.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order).map(i => i.url);
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
  };
}

export default function ProductPage() {
  const params = useParams();
  const slug   = typeof params.id === "string" ? params.id : "";
  const { addItem } = useCart();

  const [product,      setProduct]      = useState<Product | null>(null);
  const [related,      setRelated]      = useState<Product[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSide,  setSelectedSide]  = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty,          setQty]          = useState(1);
  const [addedToCart,  setAddedToCart]  = useState(false);
  const [activeImage,  setActiveImage]  = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const sb = createClient();
      const { data } = await sb
        .from("products")
        .select("*, categories(name,slug), product_images(id,url,sort_order)")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (!data) { setLoading(false); return; }
      const prod = toProduct(data as DBProduct);
      setProduct(prod);
      setSelectedSize(prod.sizes?.[0] ?? null);

      // produtos relacionados
      const { data: rel } = await sb
        .from("products")
        .select("*, categories(name,slug), product_images(url,sort_order)")
        .eq("category_id", (data as DBProduct).category_id)
        .eq("active", true)
        .neq("id", (data as DBProduct).id)
        .limit(4);

      setRelated((rel ?? []).map(r => toProduct(r as DBProduct)));
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <p style={{ color: "var(--gray-mid)", fontSize: 16 }}>Produto não encontrado.</p>
      <Link href="/" style={{ color: "var(--gold)", fontSize: 14 }}>← Voltar à loja</Link>
    </div>
  );

  const discount = (product.originalPrice && product.originalPrice > product.price)
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  function handleAddToCart() {
    if (product) addItem(product, qty, selectedSize ?? undefined, selectedSide ?? undefined, selectedColor ?? undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const catSlug = product.category.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

  return (
    <div className="px-4 sm:px-8" style={{ background: "var(--white)", paddingTop: 24, paddingBottom: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "Início", href: "/" },
          { label: product.category, href: `/categorias/${catSlug}` },
          { label: product.subcategory, href: `#` },
        ].map((b, i, arr) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href={b.href} style={{ color: i === arr.length - 1 ? "var(--gray-mid)" : "var(--gold)", fontSize: 13, textDecoration: "none", pointerEvents: i === arr.length - 1 ? "none" : "auto" }}>{b.label}</Link>
            {i < arr.length - 1 && <ChevronRight size={12} style={{ color: "var(--gray-mid)" }} />}
          </span>
        ))}
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 32, marginBottom: 48 }}>
        {/* FOTOS */}
        <div>
          <div style={{ background: "linear-gradient(135deg,#f0efe8,#e8e6dc)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1", marginBottom: 12, overflow: "hidden" }}>
            {product.images.length > 0
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={product.images[activeImage]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ textAlign: "center" }}><span style={{ fontSize: 64 }}>💍</span><p style={{ color: "var(--gray-mid)", fontSize: 12, marginTop: 8 }}>Foto em breve</p></div>
            }
          </div>
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", padding: 0, border: "none", outline: activeImage === i ? "2px solid var(--gold)" : "2px solid transparent", cursor: "pointer", flexShrink: 0 }}>
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
            {discount !== null && discount > 0 && <span style={{ background: "#e05555", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>{discount}% OFF</span>}
            {product.isNew && <span style={{ background: "linear-gradient(135deg,#8B6914,#C9A84C)", color: "var(--black)", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>NOVO</span>}
            {product.material && <span style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{product.material}</span>}
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--black)", lineHeight: 1.25, marginBottom: 16 }}>{product.name}</h1>

          {/* preço */}
          <div style={{ marginBottom: 20 }}>
            {product.originalPrice && product.originalPrice > product.price && <p style={{ color: "var(--gray-mid)", fontSize: 14, textDecoration: "line-through" }}>R$ {product.originalPrice.toFixed(2).replace(".",",")}</p>}
            <p style={{ fontSize: 32, fontWeight: 800, background: "linear-gradient(135deg,#8B6914,#C9A84C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
              R$ {product.price.toFixed(2).replace(".",",")}
            </p>
            <p style={{ color: "var(--gray-mid)", fontSize: 12, marginTop: 4 }}>ou 3x de R$ {(product.price/3).toFixed(2).replace(".",",")} sem juros</p>
          </div>

          {/* tamanhos */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--black)" }}>
                Selecione a opção de <span style={{ color: "var(--gold)", fontWeight: 700, letterSpacing: "0.03em" }}>TAMANHO / MEDIDA</span>:
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map(size => {
                  const sel = selectedSize === size;
                  return (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      style={{ padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer", transition: "all 0.15s", background: sel ? "rgba(201,168,76,0.08)" : "transparent", color: sel ? "var(--gold)" : "var(--gray-mid)", border: sel ? "2px solid var(--gold)" : "1px solid rgba(0,0,0,0.18)", boxShadow: sel ? "0 0 0 1px rgba(201,168,76,0.2)" : "none" }}>
                      {size}
                    </button>
                  );
                })}
              </div>
              {!selectedSize && <p style={{ color: "#e09055", fontSize: 12, marginTop: 8 }}>⚠ Selecione um tamanho</p>}
            </div>
          )}

          {/* lados */}
          {product.sides && product.sides.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--black)" }}>
                Selecione a opção de <span style={{ color: "var(--gold)", fontWeight: 700, letterSpacing: "0.03em" }}>LADO</span>:
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sides.map(side => {
                  const sel = selectedSide === side;
                  return (
                    <button key={side} onClick={() => setSelectedSide(side)}
                      style={{ padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer", transition: "all 0.15s", background: sel ? "rgba(201,168,76,0.08)" : "transparent", color: sel ? "var(--gold)" : "var(--gray-mid)", border: sel ? "2px solid var(--gold)" : "1px solid rgba(0,0,0,0.18)" }}>
                      {side.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              {!selectedSide && <p style={{ color: "#e09055", fontSize: 12, marginTop: 8 }}>⚠ Selecione um lado</p>}
            </div>
          )}

          {/* cores */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--black)" }}>
                Selecione a opção de{" "}
                <span style={{ color: "var(--gold)", fontWeight: 700, letterSpacing: "0.03em" }}>
                  COR / PEDRAS
                </span>
                :
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.colors.map(color => {
                  const sel = selectedColor === color;
                  return (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      style={{
                        padding: "8px 16px", borderRadius: 6, fontSize: 13,
                        fontWeight: sel ? 600 : 400, cursor: "pointer",
                        transition: "all 0.15s",
                        background: sel ? "rgba(201,168,76,0.08)" : "transparent",
                        color: sel ? "var(--gold)" : "var(--gray-mid)",
                        border: sel ? "2px solid var(--gold)" : "1px solid rgba(0,0,0,0.18)",
                        boxShadow: sel ? "0 0 0 1px rgba(201,168,76,0.2)" : "none",
                      }}>
                      {color.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              {!selectedColor && (
                <p style={{ color: "#e09055", fontSize: 12, marginTop: 8 }}>
                  ⚠ Selecione uma cor/pedra antes de adicionar ao carrinho
                </p>
              )}
            </div>
          )}

          {/* quantidade */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "var(--black)", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Quantidade</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8, overflow: "hidden" }}>
                <button onClick={() => setQty(Math.max(1, qty-1))} style={{ width: 36, height: 36, border: "none", background: "#f5f5f0", cursor: "pointer", fontSize: 18, color: "var(--gray-mid)" }}>−</button>
                <span style={{ width: 40, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{qty}</span>
<button onClick={() => setQty(qty+1)} style={{ width: 36, height: 36, border: "none", background: "#f5f5f0", cursor: "pointer", fontSize: 18, color: "var(--gray-mid)" }}>+</button>
              </div>
              <p style={{ color: product.stock > 0 ? "#4CAF50" : "#e05555", fontSize: 12, fontWeight: 600 }}>{product.stock > 0 ? "✓ Disponível" : "✕ Esgotado"}</p>
            </div>
          </div>

          {/* botões */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={handleAddToCart} className="btn-gold"
              disabled={(!!product.sizes?.length && !selectedSize) || (!!product.sides?.length && !selectedSide) || (!!product.colors?.length && !selectedColor)}
              style={{ flex: 1, padding: "13px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: product.stock === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: product.stock === 0 ? 0.5 : 1 }}>
              {addedToCart ? <><Check size={16} />Adicionado!</> : <><ShoppingCart size={16} />Adicionar ao carrinho</>}
            </button>
            <button style={{ width: 48, height: 48, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={18} style={{ color: "var(--gray-mid)" }} />
            </button>
          </div>

          {/* WhatsApp */}
          <a href={`https://wa.me/5519997103023?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name} (R$ ${product.price.toFixed(2).replace(".",",")})`)}` }
            target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(37,211,102,0.3)", color: "#25D366", background: "rgba(37,211,102,0.06)", textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            💬 Comprar via WhatsApp
          </a>

          {/* garantias */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, background: "#f9f8f4", borderRadius: 10 }}>
            {[
              { icon: <Shield size={14} />, text: "Garantia de 1 ano contra manchas e deformações" },
              { icon: <Package size={14} />, text: "Entrega para todo o Brasil" },
              { icon: <RotateCcw size={14} />, text: "Troca em até 7 dias após o recebimento" },
            ].map((g, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--gray-mid)", fontSize: 13 }}>
                <span style={{ color: "var(--gold)", flexShrink: 0 }}>{g.icon}</span>{g.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DESCRIÇÃO + CARACTERÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 24, marginBottom: 48 }}>
        {product.description && (
          <div style={{ padding: 24, background: "#f9f8f4", borderRadius: 12 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--black)", marginBottom: 12 }}>Descrição</h3>
            <p style={{ color: "var(--gray-mid)", fontSize: 14, lineHeight: 1.8 }}>{product.description}</p>
          </div>
        )}
        {product.details && product.details.length > 0 && (
          <div style={{ padding: 24, background: "#f9f8f4", borderRadius: 12 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--black)", marginBottom: 12 }}>Características</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {product.details.map((d, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, color: "var(--gray-mid)", fontSize: 14 }}>
                  <Check size={14} style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }} />{d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* RELACIONADOS */}
      {related.length > 0 && (
        <section>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--black)" }}>Produtos Relacionados</h2>
            <div style={{ height: 2, width: 40, background: "linear-gradient(90deg,#8B6914,#C9A84C)", borderRadius: 1, marginTop: 6 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
