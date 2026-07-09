"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, ShoppingCart, User, ChevronDown, X,
  Package, Heart, LogOut, MessageCircle, Trash2, Plus, Minus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-mock";
import SearchBar from "@/app/components/ui/SearchBar";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { user, loggedIn, logout } = useAuth();
  const { items, count, subtotal, removeItem, updateQty } = useCart();

  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const userRef    = useRef<HTMLDivElement>(null);
  const cartRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      if (cartRef.current && !cartRef.current.contains(e.target as Node))
        setCartOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* formata WhatsApp com lista do carrinho */
  function buildWhatsAppMsg() {
    const lines = items.map(i =>
      `• ${i.qty}x ${i.product.name}${i.selectedSize ? ` (${i.selectedSize})` : ""} — R$ ${(i.product.price * i.qty).toFixed(2).replace(".", ",")}`
    ).join("\n");
    const total = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
    return encodeURIComponent(`Olá! Gostaria de finalizar meu pedido:\n\n${lines}\n\nTotal: ${total}\n\nAguardo instruções de pagamento!`);
  }

  return (
    <>
      <header
        style={{ background: "var(--black-soft)", borderBottom: "1px solid rgba(201,168,76,0.2)" }}
        className="sticky top-0 z-50 w-full"
      >
        <div className="gap-2 sm:gap-6" style={{ display: "flex", alignItems: "center", height: 72, paddingLeft: 16, paddingRight: 16 }}>

          {/* LOGO */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-10 h-10 sm:w-[52px] sm:h-[52px]">
              <Image src="/logo.png" alt="FC Piercing e Semi Joias" fill
                style={{ objectFit: "contain" }} priority sizes="52px" />
            </div>
            <div className="hidden sm:block">
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, lineHeight: 1.1,
                background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>FC Piercing</p>
              <p style={{ color: "var(--gray-mid)", fontSize: 11, letterSpacing: "0.08em" }}>e Semi Joias</p>
            </div>
          </Link>

          {/* BUSCA */}
          <div className="hidden md:flex flex-1 justify-center">
            <div style={{ width: "100%", maxWidth: 560 }}>
              <SearchBar />
            </div>
          </div>

          {/* AÇÕES */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>

            {/* busca mobile */}
            <button className="md:hidden p-2 rounded-lg" style={{ color: "var(--gray-light)" }}
              onClick={() => setSearchOpen(!searchOpen)}>
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* conta */}
            <div ref={userRef} style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
                  borderRadius: 8, background: "none", border: "none", cursor: "pointer",
                  color: "var(--gray-light)", transition: "color 0.2s", fontSize: 14 }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--gray-light)")}
              >
                <User size={18} />
                <span className="hidden sm:block text-sm">
                  {loggedIn ? user?.name?.split(" ")?.[0] ?? user?.email?.split("@")?.[0] : "Entrar"}
                </span>
                <ChevronDown size={14} style={{ opacity: 0.6 }} />
              </button>

              {userMenuOpen && (
                <div className="animate-fadeDown w-[calc(100vw-24px)] sm:w-[224px] max-w-[224px]" style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--black-card)", border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 12, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                }}>
                  {loggedIn ? (
                    <>
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                        <p style={{ color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>
                          Olá, {user?.name?.split(" ")?.[0] ?? user?.email?.split("@")?.[0]}!
                        </p>
                      </div>
                      {[
                        { icon: <User size={14} />,    label: "Minha Conta",     href: "/conta"          },
                        { icon: <Package size={14} />, label: "Meus Pedidos",    href: "/conta?tab=pedidos" },
                        { icon: <Heart size={14} />,   label: "Lista de Desejos",href: "/conta?tab=desejos" },
                      ].map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px",
                            color: "var(--gray-light)", fontSize: 13, textDecoration: "none", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.color = "var(--gold)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--gray-light)"; }}
                        >{item.icon}{item.label}</Link>
                      ))}
                      {user?.role === "admin" && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px",
                            color: "var(--gold)", fontSize: 13, textDecoration: "none", fontWeight: 600,
                            background: "rgba(201,168,76,0.06)", borderTop: "1px solid rgba(201,168,76,0.1)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.14)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(201,168,76,0.06)")}
                        >
                          ⚙ Painel Admin
                        </Link>
                      )}
                      <button onClick={() => { logout(); setUserMenuOpen(false); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                          padding: "11px 16px", border: "none", background: "transparent", cursor: "pointer",
                          color: "#e05555", fontSize: 13, borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <LogOut size={14} />Sair
                      </button>
                    </>
                  ) : (
                    <div style={{ padding: 16 }}>
                      <Link href="/login" onClick={() => setUserMenuOpen(false)}
                        className="btn-gold" style={{ display: "block", textAlign: "center",
                          padding: "10px", borderRadius: 8, fontSize: 14, textDecoration: "none",
                          marginBottom: 8, fontWeight: 600 }}>
                        Entrar
                      </Link>
                      <Link href="/cadastro" onClick={() => setUserMenuOpen(false)}
                        className="btn-outline-gold" style={{ display: "block", textAlign: "center",
                          padding: "10px", borderRadius: 8, fontSize: 14, textDecoration: "none", fontWeight: 600 }}>
                        Criar conta
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CARRINHO */}
            <div ref={cartRef} style={{ position: "relative" }}>
              <button onClick={() => setCartOpen(!cartOpen)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
                  borderRadius: 8, background: "none", border: "none", cursor: "pointer",
                  color: "var(--gray-light)", transition: "color 0.2s", position: "relative" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--gray-light)")}
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:block" style={{ fontSize: 14 }}>Carrinho</span>
                {count > 0 && (
                  <span style={{
                    position: "absolute", top: 2, right: count > 9 ? -2 : 4,
                    background: "var(--gold)", color: "var(--black)",
                    borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{count > 99 ? "99+" : count}</span>
                )}
              </button>

              {/* ── MINI-CARRINHO DROPDOWN ── */}
              {cartOpen && (
                <div className="animate-fadeDown w-[calc(100vw-24px)] sm:w-[360px] max-w-[360px]" style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--black-card)", border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
                }}>
                  {/* header */}
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(201,168,76,0.1)",
                    display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ color: "var(--white)", fontWeight: 600, fontSize: 14 }}>
                      Meu Carrinho {count > 0 && <span style={{ color: "var(--gold)" }}>({count})</span>}
                    </p>
                    <button onClick={() => setCartOpen(false)}
                      style={{ background: "none", border: "none", color: "var(--gray-mid)", cursor: "pointer" }}>
                      <X size={16} />
                    </button>
                  </div>

                  {/* itens */}
                  {items.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                      <ShoppingCart size={36} style={{ color: "var(--gray-dark)", margin: "0 auto 12px" }} />
                      <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>Seu carrinho está vazio</p>
                      <Link href="/" onClick={() => setCartOpen(false)}
                        style={{ color: "var(--gold)", fontSize: 13, marginTop: 8, display: "inline-block" }}>
                        Ver produtos →
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div style={{ maxHeight: 300, overflowY: "auto", padding: "8px 0" }}>
                        {items.map(item => (
                          <div key={`${item.product.id}_${item.selectedSize}`}
                            style={{ display: "flex", gap: 12, padding: "10px 20px",
                              borderBottom: "1px solid rgba(201,168,76,0.06)", alignItems: "center" }}>
                            {/* foto / placeholder */}
                            <div style={{ width: 52, height: 52, borderRadius: 8, flexShrink: 0,
                              background: "linear-gradient(135deg,#f0efe8,#e8e6dc)",
                              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                              {item.product.images.length > 0
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={item.product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span style={{ fontSize: 22 }}>💍</span>
                              }
                            </div>

                            {/* info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ color: "var(--white)", fontSize: 12, fontWeight: 500,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.product.name}
                              </p>
                              {item.selectedSize && (
                                <p style={{ color: "var(--gray-mid)", fontSize: 11 }}>Tam: {item.selectedSize}</p>
                              )}
                              {item.selectedSide && (
                                <p style={{ color: "var(--gray-mid)", fontSize: 11 }}>Lado: {item.selectedSide}</p>
                              )}
                              {item.selectedColor && (
                                <p style={{ color: "var(--gray-mid)", fontSize: 11 }}>Cor: {item.selectedColor}</p>
                              )}
                              <p style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                                R$ {(item.product.price * item.qty).toFixed(2).replace(".", ",")}
                              </p>
                            </div>

                            {/* quantidade */}
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <button onClick={() => updateQty(item.product.id, item.qty - 1, item.selectedSize)}
                                style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid rgba(201,168,76,0.2)",
                                  background: "none", cursor: "pointer", color: "var(--gray-light)",
                                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Minus size={10} />
                              </button>
                              <span style={{ color: "var(--white)", fontSize: 13, fontWeight: 600, width: 20, textAlign: "center" }}>
                                {item.qty}
                              </span>
                              <button onClick={() => updateQty(item.product.id, item.qty + 1, item.selectedSize)}
                                style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid rgba(201,168,76,0.2)",
                                  background: "none", cursor: "pointer", color: "var(--gray-light)",
                                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Plus size={10} />
                              </button>
                            </div>

                            {/* remover */}
                            <button onClick={() => removeItem(item.product.id, item.selectedSize)}
                              style={{ background: "none", border: "none", cursor: "pointer",
                                color: "var(--gray-mid)", padding: 4, flexShrink: 0 }}
                              onMouseEnter={e => (e.currentTarget.style.color = "#e05555")}
                              onMouseLeave={e => (e.currentTarget.style.color = "var(--gray-mid)")}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* footer do mini-carrinho */}
                      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                          <span style={{ color: "var(--gray-light)", fontSize: 14 }}>Subtotal</span>
                          <span style={{ color: "var(--gold)", fontSize: 16, fontWeight: 700 }}>
                            R$ {subtotal.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        <Link href="/carrinho" onClick={() => setCartOpen(false)}
                          className="btn-gold" style={{ display: "block", textAlign: "center",
                            padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                            textDecoration: "none", marginBottom: 8 }}>
                          Ver carrinho completo
                        </Link>
                        <a href={`https://wa.me/5519997103023?text=${buildWhatsAppMsg()}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={() => setCartOpen(false)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "10px", borderRadius: 10, border: "1px solid rgba(37,211,102,0.3)",
                            color: "#25D366", background: "rgba(37,211,102,0.06)", textDecoration: "none",
                            fontSize: 13, fontWeight: 600 }}>
                          <MessageCircle size={15} />
                          Finalizar via WhatsApp
                        </a>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* WhatsApp fixo */}
            <a href="https://wa.me/5519997103023" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: "rgba(37,211,102,0.12)", color: "#25D366",
                border: "1px solid rgba(37,211,102,0.2)", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(37,211,102,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(37,211,102,0.12)")}
            >
              <MessageCircle size={16} />
              <span className="hidden lg:block">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* busca mobile expandida */}
        {searchOpen && (
          <div className="md:hidden animate-fadeDown px-3 sm:px-6"
            style={{ paddingBottom: 12, background: "var(--black-soft)" }}>
            <SearchBar autoFocus onClose={() => setSearchOpen(false)} />
          </div>
        )}
      </header>
    </>
  );
}
