"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trash2, Plus, Minus, ShoppingBag,
  Truck, MessageCircle, CreditCard, QrCode,
  ChevronRight, Shield,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

const SHIPPING_OPTIONS = [
  { id: "sedex", label: "SEDEX",        days: "3 a 5 dias úteis",  price: 32.50 },
  { id: "free",  label: "Frete Grátis", days: "via SEDEX",         price: 0,    note: "Pedidos acima de R$ 300" },
];

export default function CarrinhoPage() {
  const { items, count, subtotal, removeItem, updateQty, clearCart } = useCart();

  const [cep, setCep]                   = useState("");
  const [shippingCalc, setShippingCalc] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);

  const shippingPrice = SHIPPING_OPTIONS.find(s => s.id === selectedShipping)?.price ?? 0;
  const total         = subtotal + shippingPrice;
  const freeShipping  = subtotal >= 300;

  function calcShipping() {
    if (cep.replace(/\D/g, "").length < 8) return;
    setShippingCalc(true);
    setSelectedShipping("sedex");
  }

  function buildWhatsAppMsg() {
    const shipping = SHIPPING_OPTIONS.find(s => s.id === selectedShipping);
    const lines = items.map(i => {
      const opts = [i.selectedSize, i.selectedSide, i.selectedColor].filter(Boolean).join(", ");
      return `• ${i.qty}x ${i.product.name}${opts ? ` (${opts})` : ""} — R$ ${(i.product.price * i.qty).toFixed(2).replace(".", ",")}`;
    }).join("\n");
    const parts = [
      `Olá! Gostaria de finalizar meu pedido:\n\n${lines}`,
      `\nSubtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}`,
      shipping ? `Frete (${shipping.label}): ${shipping.price === 0 ? "Grátis" : `R$ ${shipping.price.toFixed(2).replace(".", ",")}` }` : null,
      `\nTotal: R$ ${total.toFixed(2).replace(".", ",")}`,
      !selectedShipping ? "\n(Frete a combinar)" : null,
      "\n\nAguardo instruções de pagamento!",
    ].filter(Boolean).join("\n");
    return encodeURIComponent(parts);
  }

  const card: React.CSSProperties = {
    background: "var(--white)", border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 12, overflow: "hidden",
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: "var(--black)",
    letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 16,
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
        <ShoppingBag size={56} style={{ color: "rgba(201,168,76,0.25)" }} />
        <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--black)" }}>
          Seu carrinho está vazio
        </p>
        <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>
          Adicione produtos para continuar comprando.
        </p>
        <Link href="/" className="btn-gold"
          style={{ padding: "12px 28px", borderRadius: 10, fontSize: 14,
            fontWeight: 600, textDecoration: "none", marginTop: 8 }}>
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8" style={{ background: "var(--white-off)", minHeight: "calc(100vh - 120px)", paddingTop: 24, paddingBottom: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
          <Link href="/" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>Início</Link>
          <ChevronRight size={12} style={{ color: "var(--gray-mid)" }} />
          <span style={{ color: "var(--gray-mid)", fontSize: 13 }}>Carrinho</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]" style={{ gap: 24, alignItems: "start" }}>

          {/* ── COLUNA ESQUERDA — itens ── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--black)" }}>
                Carrinho <span style={{ color: "var(--gold)", fontSize: 16 }}>({count} {count === 1 ? "item" : "itens"})</span>
              </h1>
              <button onClick={clearCart}
                style={{ background: "none", border: "none", color: "var(--gray-mid)",
                  fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#e05555")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--gray-mid)")}
              >
                <Trash2 size={13} /> Limpar carrinho
              </button>
            </div>

            {/* lista de itens */}
            <div style={{ ...card, marginBottom: 16 }}>
              <div className="hidden sm:grid" style={{ gridTemplateColumns: "1fr 120px 100px 40px",
                padding: "10px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)",
                background: "rgba(0,0,0,0.02)" }}>
                {["Produto", "Quantidade", "Preço", ""].map(h => (
                  <p key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-mid)",
                    letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</p>
                ))}
              </div>

              {items.map((item, i) => (
                <div key={`${item.product.id}_${item.selectedSize}`}
                  className="flex flex-col sm:grid gap-3 sm:gap-0"
                  style={{ gridTemplateColumns: "1fr 120px 100px 40px",
                    alignItems: "center", padding: "16px 20px",
                    borderBottom: i < items.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>

                  <div className="w-full sm:w-auto" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(135deg,#f0efe8,#e8e6dc)",
                      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {item.product.images.length > 0
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={item.product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: 28 }}>💍</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/produtos/${item.product.slug}`}
                        style={{ color: "var(--black)", fontSize: 14, fontWeight: 500, textDecoration: "none", lineHeight: 1.4 }}>
                        {item.product.name}
                      </Link>
                      <p style={{ color: "var(--gray-mid)", fontSize: 12, marginTop: 2 }}>
                        {item.product.material}{item.selectedSize && ` · ${item.selectedSize}`}
                      </p>
                      {item.product.stock < 5 && (
                        <p style={{ color: "#e09055", fontSize: 11, marginTop: 2 }}>
                          ⚠ Apenas {item.product.stock} em estoque
                        </p>
                      )}
                      {/* preço inline no mobile, abaixo da foto */}
                      <p className="sm:hidden" style={{ color: "var(--black)", fontSize: 15, fontWeight: 700, marginTop: 6 }}>
                        R$ {(item.product.price * item.qty).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>

                  {/* quantidade + preço + remover — linha própria no mobile */}
                  <div className="w-full sm:w-auto sm:contents" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => updateQty(item.product.id, item.qty - 1, item.selectedSize)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(0,0,0,0.12)",
                          background: "#f5f5f0", cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center" }}>
                        <Minus size={11} style={{ color: "var(--gray-mid)" }} />
                      </button>
                      <span style={{ width: 28, textAlign: "center", fontSize: 14, fontWeight: 600, color: "var(--black)" }}>
                        {item.qty}
                      </span>
                      <button onClick={() => updateQty(item.product.id, item.qty + 1, item.selectedSize)}
                        disabled={item.qty >= item.product.stock}
                        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(0,0,0,0.12)",
                          background: "#f5f5f0", cursor: item.qty >= item.product.stock ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: item.qty >= item.product.stock ? 0.4 : 1 }}>
                        <Plus size={11} style={{ color: "var(--gray-mid)" }} />
                      </button>
                    </div>

                    <div className="hidden sm:block">
                      <p style={{ color: "var(--black)", fontSize: 15, fontWeight: 700 }}>
                        R$ {(item.product.price * item.qty).toFixed(2).replace(".", ",")}
                      </p>
                      {item.qty > 1 && (
                        <p style={{ color: "var(--gray-mid)", fontSize: 11 }}>
                          R$ {item.product.price.toFixed(2).replace(".", ",")} cada
                        </p>
                      )}
                    </div>

                    <button onClick={() => removeItem(item.product.id, item.selectedSize)}
                      style={{ background: "none", border: "none", cursor: "pointer",
                        color: "var(--gray-mid)", padding: 4, display: "flex" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#e05555")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--gray-mid)")}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* calcular frete */}
            <div style={{ ...card, padding: 20 }}>
              <p style={sectionTitle}><Truck size={14} style={{ display: "inline", marginRight: 6 }} />Calcular Frete</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input value={cep} onChange={e => setCep(e.target.value.replace(/\D/g, "").slice(0, 8)
                  .replace(/(\d{5})(\d)/, "$1-$2"))}
                  placeholder="00000-000" maxLength={9}
                  style={{ flex: 1, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8,
                    padding: "10px 14px", fontSize: 14, outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
                />
                <button onClick={calcShipping} className="btn-gold"
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none",
                    fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Calcular
                </button>
              </div>

              {shippingCalc && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SHIPPING_OPTIONS.filter(s => s.id !== "free" || freeShipping).map(opt => (
                    <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${selectedShipping === opt.id ? "var(--gold)" : "rgba(0,0,0,0.08)"}`,
                      background: selectedShipping === opt.id ? "rgba(201,168,76,0.04)" : "transparent" }}>
                      <input type="radio" name="shipping" value={opt.id}
                        checked={selectedShipping === opt.id}
                        onChange={() => setSelectedShipping(opt.id)}
                        style={{ accentColor: "var(--gold)" }} />
                      <span style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--black)" }}>{opt.label}</span>
                        <span style={{ color: "var(--gray-mid)", fontSize: 12 }}> · {opt.days}</span>
                        {opt.note && <span style={{ color: "var(--gold)", fontSize: 11 }}> — {opt.note}</span>}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700,
                        color: opt.price === 0 ? "#4CAF50" : "var(--black)" }}>
                        {opt.price === 0 ? "Grátis" : `R$ ${opt.price.toFixed(2).replace(".", ",")}`}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── COLUNA DIREITA — resumo ── */}
          <div className="lg:sticky" style={{ top: 90 }}>
            <div style={{ ...card, padding: 24, marginBottom: 12 }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
                color: "var(--black)", marginBottom: 20 }}>Resumo do Pedido</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--gray-mid)", fontSize: 14 }}>Subtotal ({count} itens)</span>
                  <span style={{ color: "var(--black)", fontSize: 14, fontWeight: 500 }}>
                    R$ {subtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--gray-mid)", fontSize: 14 }}>Frete</span>
                  <span style={{ fontSize: 14, fontWeight: 500,
                    color: shippingPrice === 0 && selectedShipping ? "#4CAF50" : "var(--black)" }}>
                    {!selectedShipping ? "—" : shippingPrice === 0 ? "Grátis" : `R$ ${shippingPrice.toFixed(2).replace(".", ",")}`}
                  </span>
                </div>

                <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "4px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--black)" }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800,
                    background: "linear-gradient(135deg,#8B6914,#C9A84C)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <p style={{ color: "var(--gray-mid)", fontSize: 11, textAlign: "right" }}>
                  ou 3x de R$ {(total / 3).toFixed(2).replace(".", ",")} sem juros
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href={`https://wa.me/5519997103023?text=${buildWhatsAppMsg()}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
                    background: "rgba(37,211,102,0.1)", color: "#25D366",
                    border: "1px solid rgba(37,211,102,0.3)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(37,211,102,0.18)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(37,211,102,0.1)")}
                >
                  <MessageCircle size={17} />
                  Finalizar via WhatsApp
                </a>

                <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: "rgba(201,168,76,0.08)", color: "var(--gold)",
                  border: "1px solid rgba(201,168,76,0.25)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.15)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(201,168,76,0.08)")}
                >
                  <QrCode size={17} />
                  Pagar com Pix
                  <span style={{ fontSize: 11, background: "rgba(201,168,76,0.15)",
                    padding: "2px 6px", borderRadius: 4 }}>5% OFF</span>
                </button>

                <button className="btn-gold"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", padding: "13px", borderRadius: 10, border: "none",
                    fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  <CreditCard size={17} />
                  Pagar com Cartão
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 4px" }}>
              {[
                { icon: <Shield size={14} />, text: "Compra 100% segura" },
                { icon: <Truck size={14} />,  text: "Entrega para todo o Brasil" },
              ].map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8,
                  color: "var(--gray-mid)", fontSize: 12 }}>
                  <span style={{ color: "var(--gold)" }}>{g.icon}</span>
                  {g.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
