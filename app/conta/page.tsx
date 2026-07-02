"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Package, Heart, LogOut, MapPin, Lock,
  Edit2, Plus, Trash2, ChevronRight, ShoppingBag, LayoutDashboard, CreditCard,
} from "lucide-react";
import { useAuth, Order, Address } from "@/lib/auth-mock";
import { createClient } from "@/lib/supabase/client";

type Tab = "conta" | "pedidos" | "desejos" | "cartoes";

const statusStyle: Record<Order["status"], { color: string; bg: string; label: string }> = {
  processando: { color: "#C9A84C", bg: "rgba(201,168,76,0.1)",  label: "Processando" },
  enviado:     { color: "#5B9BD5", bg: "rgba(91,155,213,0.1)",  label: "Enviado"     },
  entregue:    { color: "#4CAF50", bg: "rgba(76,175,80,0.1)",   label: "Entregue"    },
  cancelado:   { color: "#e05555", bg: "rgba(224,85,85,0.1)",   label: "Cancelado"   },
};

export default function ContaPage() {
  const { user, loggedIn, loading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("conta");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });
  const [addressModal, setAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Casa", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", is_primary: false,
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(201,168,76,0.2)",
          borderTopColor: "var(--gold)",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!loggedIn || !user) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "var(--gray-mid)", fontSize: 15 }}>Você precisa estar logado para acessar esta página.</p>
        <Link href="/login" className="btn-gold" style={{ padding: "10px 24px", borderRadius: 8, fontSize: 14 }}>
          Entrar
        </Link>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  async function saveEdit() {
    const supabase = createClient();
    if (user) {
      await supabase.from("profiles").update({
        name: editForm.name,
        phone: editForm.phone,
        updated_at: new Date().toISOString(),
      } as never).eq("id", user.id);
    }
    updateUser({ name: editForm.name, phone: editForm.phone });
    setEditing(false);
  }

  function removeWishlistItem(id: string) {
    updateUser({ wishlist: user?.wishlist.filter((w) => w.id !== id) });
  }

  async function saveAddress() {
    if (!user) return;
    if (!addressForm.cep || !addressForm.street || !addressForm.number || !addressForm.city || !addressForm.state) {
      setAddressError("Preencha todos os campos obrigatórios."); return;
    }
    setAddressLoading(true);
    setAddressError("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("addresses").insert({
        user_id:      user.id,
        label:        addressForm.label || "Casa",
        cep:          addressForm.cep.replace(/\D/g, ""),
        street:       addressForm.street,
        number:       addressForm.number,
        complement:   addressForm.complement || null,
        neighborhood: addressForm.neighborhood,
        city:         addressForm.city,
        state:        addressForm.state.toUpperCase().slice(0, 2),
        is_primary:   addressForm.is_primary,
      } as never).select().single();
      if (error) throw new Error(error.message);
      updateUser({ addresses: [...(user.addresses ?? []), data as Address] });
      setAddressModal(false);
    } catch (err: unknown) {
      setAddressError(err instanceof Error ? err.message : "Erro ao salvar endereço.");
    } finally {
      setAddressLoading(false);
    }
  }

  async function deleteAddress(id: string) {
    if (!user || !confirm("Remover este endereço?")) return;
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", id);
    updateUser({ addresses: user.addresses.filter(a => a.id !== id) });
  }

  /* ── estilos reutilizáveis ── */
  const card = {
    background: "var(--black-soft)",
    border: "1px solid rgba(201,168,76,0.15)",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  } as React.CSSProperties;

  const sectionTitle = {
    fontFamily: "var(--font-display)",
    fontSize: 16,
    background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: 16,
  } as React.CSSProperties;

  const fieldLabel = { color: "var(--gold)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 4 };
  const fieldValue = { color: "var(--white)", fontSize: 14 };
  const inputStyle = {
    width: "100%", background: "var(--black-mid)",
    border: "1px solid rgba(201,168,76,0.25)", borderRadius: 8,
    padding: "9px 12px", color: "var(--white)", fontSize: 14, outline: "none",
  } as React.CSSProperties;

  return (
    <div className="px-4 sm:px-8" style={{ minHeight: "calc(100vh - 120px)", background: "var(--white)", paddingTop: 32, paddingBottom: 32 }}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]" style={{ maxWidth: 1000, margin: "0 auto", gap: 24, alignItems: "start" }}>

        {/* ── SIDEBAR — só desktop ── */}
        <div className="hidden lg:block" style={{ background: "var(--black-soft)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 12, overflow: "hidden", position: "sticky", top: 90 }}>
          {/* avatar */}
          <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(201,168,76,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg,#8B6914,#C9A84C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "var(--black)", fontWeight: 700, fontSize: 16 }}>
                {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p style={{ color: "var(--white)", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user.name}</p>
              <p style={{ color: "var(--gray-mid)", fontSize: 11 }}>{user.email}</p>
            </div>
          </div>

          {/* links */}
          {([
            { id: "conta",   icon: <User size={15} />,       label: "Minha Conta"     },
            { id: "pedidos", icon: <Package size={15} />,    label: "Meus Pedidos"    },
            { id: "desejos",  icon: <Heart size={15} />,       label: "Lista de Desejos" },
            { id: "cartoes",  icon: <CreditCard size={15} />, label: "Cartões Salvos"  },
          ] as { id: Tab; icon: React.ReactNode; label: string }[]).map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "12px 20px", border: "none", cursor: "pointer",
                background: tab === item.id ? "rgba(201,168,76,0.1)" : "transparent",
                borderLeft: tab === item.id ? "3px solid var(--gold)" : "3px solid transparent",
                color: tab === item.id ? "var(--gold)" : "var(--gray-light)",
                fontSize: 13, transition: "all 0.15s",
              }}
            >
              {item.icon}{item.label}
            </button>
          ))}

          {/* botão admin — só aparece se role === "admin" */}
          {user.role === "admin" && (
            <div style={{ padding: "8px 8px 0" }}>
              <Link href="/admin"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, textDecoration: "none",
                  background: "linear-gradient(135deg, rgba(139,105,20,0.2), rgba(201,168,76,0.15))",
                  border: "1px solid rgba(201,168,76,0.3)",
                  color: "var(--gold)", fontSize: 13, fontWeight: 600,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(139,105,20,0.35), rgba(201,168,76,0.25))")}
                onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(139,105,20,0.2), rgba(201,168,76,0.15))")}
              >
                <LayoutDashboard size={15} />
                Painel Admin
              </Link>
            </div>
          )}

          <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", marginTop: 4 }}>
            <Link href="/conta/alterar-senha"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 20px", color: "var(--gray-light)", fontSize: 13,
                textDecoration: "none", transition: "color 0.15s",
                borderLeft: "3px solid transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gray-light)")}
            >
              <Lock size={15} />Alterar Senha
            </Link>
            <button onClick={handleLogout}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "12px 20px", border: "none", cursor: "pointer",
                background: "transparent", color: "#e05555", fontSize: 13,
                borderLeft: "3px solid transparent",
              }}
            >
              <LogOut size={15} />Sair
            </button>
          </div>
        </div>

        {/* ── CONTEÚDO ── */}
        <div>
          {/* abas mobile */}
          <div className="lg:hidden" style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto" }}>
            {(["conta", "pedidos", "desejos", "cartoes"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: tab === t ? "linear-gradient(135deg,#8B6914,#C9A84C)" : "var(--black-soft)",
                  color: tab === t ? "var(--black)" : "var(--gray-light)",
                  fontSize: 13, fontWeight: 600, flexShrink: 0,
                  borderWidth: 1, borderStyle: "solid",
                  borderColor: tab !== t ? "rgba(201,168,76,0.2)" : "transparent",
                } as React.CSSProperties}
              >
                {{ conta: "Minha Conta", pedidos: "Meus Pedidos", desejos: "Desejos", cartoes: "Cartões" }[t]}
              </button>
            ))}
          </div>

          {/* atalhos extra mobile — senha / admin / sair (no desktop já estão na sidebar) */}
          <div className="lg:hidden" style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
            <Link href="/conta/alterar-senha"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", color: "var(--gray-mid)", fontSize: 12, textDecoration: "none", flexShrink: 0 }}>
              <Lock size={12} />Alterar Senha
            </Link>
            {user.role === "admin" && (
              <Link href="/admin"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.08)", color: "var(--gold)", fontSize: 12, fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                ⚙ Painel Admin
              </Link>
            )}
            <button onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(224,85,85,0.25)", background: "none", color: "#e05555", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
              <LogOut size={12} />Sair
            </button>
          </div>

          {/* ── TAB: MINHA CONTA ── */}
          {tab === "conta" && (
            <>
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={sectionTitle}>Dados Cadastrais</p>
                  <button onClick={() => { setEditing(!editing); setEditForm({ name: user.name ?? "", phone: user.phone ?? "" }); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "6px 12px", color: "var(--gold)", fontSize: 12, cursor: "pointer" }}>
                    <Edit2 size={12} />{editing ? "Cancelar" : "Editar"}
                  </button>
                </div>

                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                    <div>
                      <p style={fieldLabel}>Nome</p>
                      <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <p style={fieldLabel}>Telefone</p>
                      <input style={inputStyle} value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: "1/-1", display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} className="btn-gold" style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, border: "none", cursor: "pointer" }}>
                        Salvar alterações
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                    {[
                      { label: "Nome", value: user.name ?? "" },
                      { label: "E-mail", value: user.email },
                      { label: "Telefone", value: user.phone },
                      { label: user.account_type === "pessoa_fisica" ? "CPF" : "CNPJ", value: user.account_type === "pessoa_fisica" ? user.cpf : user.cnpj },
                    ].map((f) => (
                      <div key={f.label}>
                        <p style={fieldLabel}>{f.label}</p>
                        <p style={fieldValue}>{f.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* endereços */}
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={sectionTitle}>Endereços</p>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "6px 12px", color: "var(--gold)", fontSize: 12, cursor: "pointer" }}>
                    <Plus size={12} />Novo endereço
                  </button>
                </div>
                {user.addresses.length === 0 ? (
                  <p style={{ color: "var(--gray-mid)", fontSize: 13 }}>Nenhum endereço cadastrado.</p>
                ) : (
                  user.addresses.map((addr: Address) => (
                    <div key={addr.id} style={{
                      padding: 16, borderRadius: 10,
                      border: addr.is_primary ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(201,168,76,0.1)",
                      background: addr.is_primary ? "rgba(201,168,76,0.04)" : "transparent",
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <MapPin size={16} style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                            <p style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>{addr.label}</p>
                            {addr.is_primary && (
                              <span style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                                PRINCIPAL
                              </span>
                            )}
                          </div>
                          <p style={{ color: "var(--gray-mid)", fontSize: 13, lineHeight: 1.6 }}>
                            {addr.street}, {addr.number} — {addr.neighborhood}<br />
                            {addr.city} / {addr.state} · CEP {addr.cep}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={{ background: "none", border: "none", color: "var(--gray-mid)", cursor: "pointer", padding: 4 }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteAddress(addr.id)} style={{ background: "none", border: "none", color: "#e05555", cursor: "pointer", padding: 4 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ── TAB: MEUS PEDIDOS ── */}
          {tab === "pedidos" && (
            <div style={card}>
              <p style={sectionTitle}>Meus Pedidos</p>
              {user.orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <ShoppingBag size={40} style={{ color: "var(--gray-dark)", margin: "0 auto 12px" }} />
                  <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>Você ainda não fez nenhum pedido.</p>
                  <Link href="/" style={{ color: "var(--gold)", fontSize: 13, marginTop: 8, display: "inline-block" }}>
                    Ver produtos →
                  </Link>
                </div>
              ) : (
                user.orders.map((order: Order) => {
                  const s = statusStyle[order.status];
                  return (
                    <div key={order.id} style={{
                      border: "1px solid rgba(201,168,76,0.12)", borderRadius: 10,
                      padding: 16, marginBottom: 12,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div>
                          <p style={{ color: "var(--white)", fontSize: 13, fontWeight: 600 }}>{order.id}</p>
                          <p style={{ color: "var(--gray-mid)", fontSize: 12 }}>
                            {new Date(order.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>
                            {s.label}
                          </span>
                          <p style={{ color: "var(--gold)", fontSize: 14, fontWeight: 700 }}>
                            R$ {order.total.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                      <div style={{ borderTop: "1px solid rgba(201,168,76,0.08)", paddingTop: 10 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "var(--gray-mid)", fontSize: 13, marginBottom: 4 }}>
                            <span>{item.qty}x {item.name}</span>
                            <span>R$ {item.price.toFixed(2).replace(".", ",")}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: "6px 12px", color: "var(--gray-light)", fontSize: 12, cursor: "pointer" }}>
                          <ChevronRight size={12} />Ver detalhes
                        </button>
                        {order.status === "enviado" && (
                          <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid rgba(91,155,213,0.3)", borderRadius: 6, padding: "6px 12px", color: "#5B9BD5", fontSize: 12, cursor: "pointer" }}>
                            Rastrear pedido
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── TAB: CARTÕES SALVOS ── */}
          {tab === "cartoes" && (
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={sectionTitle}>Cartões Salvos</p>
                <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "6px 12px", color: "var(--gold)", fontSize: 12, cursor: "pointer" }}>
                  <Plus size={12} />Novo cartão
                </button>
              </div>
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <CreditCard size={40} style={{ color: "var(--gray-dark)", margin: "0 auto 12px" }} />
                <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>Você ainda não possui nenhum cartão salvo.</p>
                <p style={{ color: "var(--gray-dark)", fontSize: 12, marginTop: 8 }}>
                  Seus cartões serão salvos automaticamente ao finalizar uma compra com cartão de crédito.
                </p>
              </div>
            </div>
          )}

          {/* ── TAB: LISTA DE DESEJOS ── */}
          {tab === "desejos" && (
            <div style={card}>
              <p style={sectionTitle}>Lista de Desejos</p>
              {user.wishlist.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Heart size={40} style={{ color: "var(--gray-dark)", margin: "0 auto 12px" }} />
                  <p style={{ color: "var(--gray-mid)", fontSize: 14 }}>Sua lista de desejos está vazia.</p>
                  <Link href="/" style={{ color: "var(--gold)", fontSize: 13, marginTop: 8, display: "inline-block" }}>
                    Ver produtos →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  {user.wishlist.map((item) => (
                    <div key={item.id} style={{
                      border: "1px solid rgba(201,168,76,0.12)", borderRadius: 10,
                      overflow: "hidden", background: "var(--black-mid)",
                    }}>
                      {/* imagem placeholder */}
                      <div style={{ height: 140, background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Heart size={32} style={{ color: "rgba(201,168,76,0.2)" }} />
                      </div>
                      <div style={{ padding: 12 }}>
                        <p style={{ color: "var(--white)", fontSize: 13, marginBottom: 4, lineHeight: 1.4 }}>{item.name}</p>
                        <p style={{ color: "var(--gold)", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                          R$ {item.price.toFixed(2).replace(".", ",")}
                        </p>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-gold" style={{ flex: 1, padding: "7px", borderRadius: 6, fontSize: 12, border: "none", cursor: "pointer" }}>
                            Comprar
                          </button>
                          <button onClick={() => removeWishlistItem(item.id)}
                            style={{ padding: "7px 8px", borderRadius: 6, border: "1px solid rgba(224,85,85,0.3)", background: "none", color: "#e05555", cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
