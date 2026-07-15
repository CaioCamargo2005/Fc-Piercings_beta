"use client";

import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/lib/products-mock";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-mock";
import { HIDE_PRICES_FOR_GUESTS } from "@/lib/store-config";
import { Lock } from "lucide-react";

type Props = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

export default function ProductCard({ product, onAddToCart }: Props) {
  const { addItem, isInCart } = useCart();
  const { loggedIn } = useAuth();
  const showPrices = !HIDE_PRICES_FOR_GUESTS || loggedIn;

  const discount = (product.originalPrice && product.originalPrice > product.price)
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(201,168,76,0.15)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* badges */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2, display: "flex", flexDirection: "column", gap: 4 }}>
        {discount !== null && discount > 0 && (
          <span style={{ background: "#e05555", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 4 }}>
            {discount}% OFF
          </span>
        )}
        {product.isNew && (
          <span style={{ background: "linear-gradient(135deg,#8B6914,#C9A84C)", color: "var(--black)", fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 4 }}>
            NOVO
          </span>
        )}
      </div>

      {/* botão favorito */}
      <button
        style={{
          position: "absolute", top: 10, right: 10, zIndex: 2,
          background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%",
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "background 0.15s",
        }}
        title="Adicionar à lista de desejos"
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,1)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)")}
      >
        <Heart size={15} style={{ color: "var(--gray-mid)" }} />
      </button>

      {/* imagem */}
      <Link href={`/produtos/${product.slug}`}>
        <div style={{
          width: "100%", aspectRatio: "1",
          background: "linear-gradient(135deg, #f0efe8, #e8e6dc)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {product.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            /* placeholder elegante enquanto não tem foto */
            <div style={{ textAlign: "center", padding: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", margin: "0 auto 8px",
                background: "rgba(201,168,76,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 24 }}>💍</span>
              </div>
              <p style={{ color: "var(--gray-mid)", fontSize: 10, letterSpacing: "0.06em" }}>SEM FOTO</p>
            </div>
          )}
        </div>
      </Link>

      {/* esgotado overlay */}
      {product.stock === 0 && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, borderRadius: 12 }}>
          <span style={{ background: "rgba(224,85,85,0.9)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20 }}>ESGOTADO</span>
        </div>
      )}

      {/* info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ color: "var(--gray-mid)", fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>
          {product.subcategory}
        </p>
        <Link href={`/produtos/${product.slug}`} style={{ textDecoration: "none" }}>
          <p style={{
            color: "var(--black)", fontSize: 13, fontWeight: 500, lineHeight: 1.4,
            marginBottom: 8, minHeight: 36,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {product.name}
          </p>
        </Link>

        {/* preços — ocultos para visitantes quando HIDE_PRICES_FOR_GUESTS */}
        {showPrices ? (
          <div style={{ marginBottom: 10 }}>
            {product.originalPrice && product.originalPrice > product.price && (
              <p style={{ color: "var(--gray-mid)", fontSize: 11, textDecoration: "line-through" }}>
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </p>
            )}
            <p style={{
              fontSize: 16, fontWeight: 700,
              background: "linear-gradient(135deg,#8B6914,#C9A84C)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: 10 }}>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 600, color: "var(--gold-dark)",
              textDecoration: "none",
            }}>
              <Lock size={13} />
              Entre para ver o preço
            </Link>
          </div>
        )}

        {/* botão adicionar */}
        <button
          onClick={() => {
            if (!showPrices) { window.location.href = "/login"; return; }
            if (product.stock > 0) { addItem(product, 1); onAddToCart?.(product); }
          }}
          className="btn-gold"
          style={{
            width: "100%", padding: "8px", borderRadius: 8, border: "none",
            fontSize: 12, fontWeight: 600, cursor: product.stock === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: product.stock === 0 ? 0.5 : 1,
          }}
        >
          <ShoppingCart size={13} />
          {showPrices ? "Adicionar" : "Entrar para comprar"}
        </button>
      </div>
    </div>
  );
}
