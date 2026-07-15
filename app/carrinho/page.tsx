"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trash2, Plus, Minus, ShoppingBag,
  Truck, MessageCircle, CreditCard, QrCode,
  ChevronRight, Shield, MapPin,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-mock";
import { HIDE_PRICES_FOR_GUESTS } from "@/lib/store-config";
import { createClient } from "@/lib/supabase/client";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const SHIPPING_OPTIONS = [
  { id: "sedex", label: "SEDEX",        days: "3 a 5 dias úteis",  price: 32.50 },
  { id: "free",  label: "Frete Grátis", days: "via SEDEX",         price: 0,    note: "Pedidos acima de R$ 300" },
];

export default function CarrinhoPage() {
  const { items, count, subtotal, removeItem, updateQty, clearCart } = useCart();
  const { user, loggedIn } = useAuth();

  const [cep, setCep]                   = useState("");
  const [shippingCalc, setShippingCalc] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);

  // ── endereço de entrega (obrigatório para finalizar) ──
  const [estado, setEstado]   = useState("");
  const [cidade, setCidade]   = useState("");
  const [rua, setRua]         = useState("");
  const [bairro, setBairro]   = useState("");
  const [numero, setNumero]   = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [cepLoading, setCepLoading]   = useState(false);

  // pré-preenche com o endereço salvo na conta (só campos ainda vazios)
  useEffect(() => {
    if (!user) return;
    if (user.address_cep && !cep) setCep(user.address_cep);
    if (user.address_state && !estado)     setEstado(user.address_state);
    if (user.address_city && !cidade)      setCidade(user.address_city);
    if (user.address_street && !rua)       setRua(user.address_street);
    if (user.address_district && !bairro)  setBairro(user.address_district);
    if (user.address_number && !numero)    setNumero(user.address_number);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // busca o endereço pelo CEP no ViaCEP quando completa 8 dígitos
  async function lookupCep(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (data.uf)          setEstado(data.uf);
        if (data.localidade)  setCidade(data.localidade);
        if (data.logradouro)  setRua(data.logradouro);
        if (data.bairro)      setBairro(data.bairro);
      }
    } catch { /* offline ou CEP inválido — usuário preenche na mão */ }
    finally { setCepLoading(false); }
  }

  const addressComplete =
    cep.replace(/\D/g, "").length === 8 &&
    estado !== "" && cidade.trim() !== "" &&
    rua.trim() !== "" && bairro.trim() !== "" && numero.trim() !== "";

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError]     = useState<string | null>(null);

  // ── Pix nativo ──
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError]     = useState<string | null>(null);
  const [pixEmail, setPixEmail]     = useState("");
  const [pixData, setPixData]       = useState<{
    id: string; ref: string; qr: string; qrImg: string;
  } | null>(null);
  const [pixCopied, setPixCopied]   = useState(false);

  // e-mail do Pix: pré-preenche com o da conta
  useEffect(() => {
    if (user?.email && !pixEmail) setPixEmail(user.email);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // enquanto o QR está aberto, consulta o status a cada 4s
  useEffect(() => {
    if (!pixData) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/status?id=${pixData.id}`);
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(timer);
          window.location.href =
            `/pedido?status=approved&payment_id=${pixData.id}&external_reference=${pixData.ref}`;
        }
      } catch { /* tenta de novo no próximo tick */ }
    }, 4000);
    return () => clearInterval(timer);
  }, [pixData]);

  // salva o resumo do pedido para a página /pedido montar a confirmação
  function saveOrderSummary() {
    const enderecoStr =
      `${rua}, ${numero} — ${bairro}\n${cidade}/${estado}\nCEP: ${cep}`;
    const lines = items.map(it => {
      const extras = [it.selectedSize, it.selectedSide, it.selectedColor]
        .filter(Boolean).join(", ");
      return `${it.qty}x ${it.product.name}${extras ? ` (${extras})` : ""}`;
    });
    localStorage.setItem("fc-last-order", JSON.stringify({
      lines,
      address: enderecoStr,
      total: `R$ ${total.toFixed(2).replace(".", ",")}`,
    }));
  }

  // gera o pagamento Pix e abre o QR
  async function handlePix() {
    if (!addressComplete || pixLoading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixEmail)) {
      setPixError("Informe um e-mail válido para o comprovante do Pix.");
      return;
    }
    setPixLoading(true);
    setPixError(null);
    try {
      persistAddress();
      saveOrderSummary();
      const res = await fetch("/api/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          email: pixEmail,
          description: `Pedido FC Piercing — ${count} ${count === 1 ? "item" : "itens"}`,
          address: { cep, estado, cidade, rua, bairro, numero },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.qr_code) {
        throw new Error(data.error || "Não foi possível gerar o Pix.");
      }
      setPixData({
        id: String(data.id),
        ref: data.external_reference,
        qr: data.qr_code,
        qrImg: data.qr_code_base64,
      });
    } catch (e: unknown) {
      setPixError(e instanceof Error ? e.message : "Erro ao gerar Pix.");
    } finally {
      setPixLoading(false);
    }
  }

  function copyPix() {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.qr).then(() => {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    });
  }

  // inicia o pagamento online: salva resumo p/ a página /pedido,
  // cria a preferência no MP e redireciona
  async function handleOnlinePayment() {
    if (!addressComplete || payLoading) return;
    setPayLoading(true);
    setPayError(null);
    try {
      persistAddress(); // endereço na conta (fire-and-forget)

      const shipping = SHIPPING_OPTIONS.find(s => s.id === selectedShipping);
      saveOrderSummary();

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(it => ({
            title: it.product.name,
            quantity: it.qty,
            unit_price: it.product.price,
          })),
          shipping: shipping && shipping.price > 0
            ? { label: shipping.label, price: shipping.price }
            : null,
          address: { cep, estado, cidade, rua, bairro, numero },
          payerEmail: user?.email ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        throw new Error(data.error || "Não foi possível iniciar o pagamento.");
      }
      window.location.href = data.init_point;
    } catch (e: unknown) {
      setPayError(e instanceof Error ? e.message : "Erro ao iniciar pagamento.");
      setPayLoading(false);
    }
  }

  // salva o endereço na conta ao finalizar (se logado e marcado)
  async function persistAddress() {
    if (!loggedIn || !user || !saveAddress) return;
    try {
      const sb = createClient();
      await sb.from("profiles").update({
        address_cep: cep,
        address_state: estado,
        address_city: cidade,
        address_street: rua,
        address_district: bairro,
        address_number: numero,
      } as never).eq("id", user.id);
    } catch (e) { console.error("persistAddress:", e); }
  }

  // modo atacado: carrinho (preços e checkout) exige login
  const cartLocked = HIDE_PRICES_FOR_GUESTS && !loggedIn;

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
    const endereco =
      `\nEndereço de entrega:\n` +
      `${rua}, ${numero} — ${bairro}\n` +
      `${cidade}/${estado}\n` +
      `CEP: ${cep}`;
    const parts = [
      `Olá! Gostaria de finalizar meu pedido:\n\n${lines}`,
      endereco,
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

  // modo atacado: visitante com itens antigos no carrinho precisa
  // logar para ver preços e finalizar
  if (cartLocked) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
        <ShoppingBag size={56} style={{ color: "rgba(201,168,76,0.25)" }} />
        <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--black)", textAlign: "center" }}>
          Entre para ver preços e finalizar
        </p>
        <p style={{ color: "var(--gray-mid)", fontSize: 14, textAlign: "center" }}>
          {count > 0
            ? `Você tem ${count} ${count === 1 ? "item guardado" : "itens guardados"} no carrinho.`
            : "Faça login para montar seu carrinho."}
        </p>
        <Link href="/login" className="btn-gold"
          style={{ padding: "12px 28px", borderRadius: 10, fontSize: 14,
            fontWeight: 600, textDecoration: "none", marginTop: 8 }}>
          Fazer login
        </Link>
        <Link href="/cadastro" style={{ color: "var(--gold-dark)", fontSize: 13, textDecoration: "none" }}>
          Não tem conta? Cadastre-se grátis
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

            {/* entrega: endereço (obrigatório) + frete */}
            <div style={{ ...card, padding: 20 }}>
              <p style={sectionTitle}><MapPin size={14} style={{ display: "inline", marginRight: 6 }} />Endereço de Entrega</p>

              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input value={cep}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
                    setCep(v);
                    lookupCep(v); // auto-preenche rua/bairro/cidade/UF quando completa
                  }}
                  placeholder="CEP: 00000-000" maxLength={9}
                  style={{ flex: 1, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8,
                    padding: "10px 14px", fontSize: 14, outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
                />
                <button onClick={calcShipping} className="btn-gold"
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none",
                    fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {cepLoading ? "..." : "Calcular frete"}
                </button>
              </div>

              {(() => {
                const inp: React.CSSProperties = {
                  width: "100%", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8,
                  padding: "10px 14px", fontSize: 14, outline: "none", background: "var(--white)",
                  color: "var(--black)",
                };
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <input value={rua} onChange={e => setRua(e.target.value)} placeholder="Rua"
                      style={{ ...inp, gridColumn: "1 / -1" }} />
                    <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="Número" style={inp} />
                    <input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" style={inp} />
                    <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" style={inp} />
                    <input value={pixEmail} onChange={e => setPixEmail(e.target.value)}
                      placeholder="E-mail (comprovante do pagamento)" type="email"
                      style={{ ...inp, gridColumn: "1 / -1" }} />
                    <select value={estado} onChange={e => setEstado(e.target.value)}
                      style={{ ...inp, color: estado ? "var(--black)" : "var(--gray-mid)" }}>
                      <option value="">Estado (UF)</option>
                      {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                    {loggedIn && (
                      <label style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8,
                        fontSize: 13, color: "var(--gray-mid)", cursor: "pointer" }}>
                        <input type="checkbox" checked={saveAddress}
                          onChange={e => setSaveAddress(e.target.checked)}
                          style={{ accentColor: "var(--gold)" }} />
                        Salvar endereço na minha conta
                      </label>
                    )}
                  </div>
                );
              })()}

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
                {addressComplete && (
                  <button onClick={handlePix} disabled={pixLoading}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", padding: "13px", borderRadius: 10, fontSize: 14,
                      fontWeight: 600, border: "1px solid rgba(0,168,132,0.4)",
                      background: "rgba(0,168,132,0.1)", color: "#00A884",
                      marginBottom: 10,
                      cursor: pixLoading ? "wait" : "pointer",
                      opacity: pixLoading ? 0.6 : 1,
                    }}>
                    <QrCode size={17} />
                    {pixLoading ? "Gerando Pix..." : "Pagar com Pix (aprovação na hora)"}
                  </button>
                )}
                {pixError && (
                  <p style={{ fontSize: 12, color: "#e05555", textAlign: "center", marginBottom: 10 }}>
                    {pixError}
                  </p>
                )}
                {addressComplete && (
                  <button onClick={handleOnlinePayment} disabled={payLoading}
                    className="btn-gold"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", padding: "13px", borderRadius: 10, fontSize: 14,
                      fontWeight: 600, border: "none", marginBottom: 10,
                      cursor: payLoading ? "wait" : "pointer",
                      opacity: payLoading ? 0.6 : 1,
                    }}>
                    <CreditCard size={17} />
                    {payLoading ? "Abrindo pagamento..." : "Pagar com cartão ou boleto"}
                  </button>
                )}
                {payError && (
                  <p style={{ fontSize: 12, color: "#e05555", textAlign: "center", marginBottom: 10 }}>
                    {payError}
                  </p>
                )}
                {addressComplete ? (
                  <a href={`https://wa.me/5519997103023?text=${buildWhatsAppMsg()}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => { persistAddress(); }}
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
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                      background: "rgba(0,0,0,0.05)", color: "var(--gray-mid)",
                      border: "1px solid rgba(0,0,0,0.1)", cursor: "not-allowed" }}>
                      <MessageCircle size={17} />
                      Finalizar via WhatsApp
                    </div>
                    <p style={{ fontSize: 12, color: "#e05555", textAlign: "center" }}>
                      Preencha o endereço de entrega para finalizar
                    </p>
                  </div>
                )}
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
      {/* ── modal do Pix ── */}
      {pixData && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16,
          background: "rgba(0,0,0,0.75)" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px",
            width: "100%", maxWidth: 400, textAlign: "center",
            maxHeight: "90vh", overflowY: "auto" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
              color: "var(--black)", marginBottom: 4 }}>
              Pague com Pix
            </p>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              Escaneie o QR Code no app do seu banco<br />ou use o copia-e-cola
            </p>

            {pixData.qrImg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`data:image/png;base64,${pixData.qrImg}`} alt="QR Code Pix"
                style={{ width: 220, height: 220, margin: "0 auto 16px", display: "block",
                  border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8 }} />
            )}

            <button onClick={copyPix}
              style={{ width: "100%", padding: "12px", borderRadius: 8, fontSize: 13,
                fontWeight: 600, border: "1px solid rgba(0,168,132,0.4)",
                background: pixCopied ? "#00A884" : "rgba(0,168,132,0.08)",
                color: pixCopied ? "#fff" : "#00A884",
                cursor: "pointer", marginBottom: 14 }}>
              {pixCopied ? "✓ Código copiado!" : "Copiar código Pix (copia e cola)"}
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%",
                background: "var(--gold)", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 13, color: "#666" }}>
                Aguardando pagamento — a confirmação é automática
              </span>
            </div>
            <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>

            <p style={{ fontSize: 11.5, color: "#999", marginBottom: 14 }}>
              Total: R$ {total.toFixed(2).replace(".", ",")} · Pedido {pixData.ref}
            </p>

            <button onClick={() => setPixData(null)}
              style={{ background: "none", border: "none", fontSize: 13, color: "#999",
                cursor: "pointer", textDecoration: "underline" }}>
              Cancelar e voltar ao carrinho
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
