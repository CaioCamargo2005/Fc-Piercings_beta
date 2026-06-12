"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-mock";
import { MOCK_PRODUCTS, Product } from "@/lib/products-mock";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Package,
  LayoutDashboard, LogOut, Search, X, Check, ImagePlus,
} from "lucide-react";

type AdminTab = "produtos" | "pedidos";

const EMPTY_PRODUCT: Omit<Product, "id" | "createdAt"> = {
  name: "", slug: "", price: 0, originalPrice: undefined,
  category: "Titânio Natural", subcategory: "",
  material: "", description: "", details: [],
  images: [], stock: 0, sizes: [], colors: [],
  featured: false, isNew: false, onSale: false, active: true,
};

const CATEGORIES = ["Titânio Natural", "Titânio PVD Gold", "Aço Natural", "Aço PVD Gold"];

export default function AdminPage() {
  const { user, loggedIn, loading, logout } = useAuth();
  const [tab, setTab] = useState<AdminTab>("produtos");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id" | "createdAt">>(EMPTY_PRODUCT);
  const [detailInput, setDetailInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [imageError, setImageError] = useState("");

  /* ── Proteção de rota ── */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(201,168,76,0.2)", borderTopColor: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "var(--gray-mid)" }}>Acesso restrito.</p>
        <a href="/login" style={{ color: "var(--gold)", fontSize: 14 }}>← Fazer login</a>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "var(--gray-mid)" }}>Você não tem permissão para acessar esta página.</p>
        <a href="/" style={{ color: "var(--gold)", fontSize: 14 }}>← Voltar à loja</a>
      </div>
    );
  }

  function setField(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function openNew() {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setDetailInput("");
    setSizeInput("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setForm({ ...p });
    setDetailInput("");
    setSizeInput("");
    setModalOpen(true);
  }

  function saveProduct() {
    if (!form.name || !form.price) return;
    const slug = form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...form, slug, id: p.id, createdAt: p.createdAt } : p));
    } else {
      const newProd: Product = { ...form, slug, id: String(Date.now()), createdAt: new Date().toISOString().slice(0, 10) };
      setProducts(prev => [newProd, ...prev]);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setModalOpen(false); }, 800);
  }

  function deleteProduct(id: string) {
    if (confirm("Remover este produto?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  }

  function toggleActive(id: string) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }

  function handleImageFiles(files: FileList | null) {
    if (!files) return;
    setImageError("");
    const current = form.images ?? [];
    if (current.length + files.length > 5) {
      setImageError("Máximo de 5 fotos por produto.");
      return;
    }
    const readers: Promise<string>[] = Array.from(files).map(file => {
      if (!file.type.startsWith("image/")) {
        setImageError("Apenas arquivos de imagem são aceitos.");
        return Promise.resolve("");
      }
      if (file.size > 4 * 1024 * 1024) {
        setImageError("Cada foto deve ter no máximo 4MB.");
        return Promise.resolve("");
      }
      return new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string ?? "");
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(results => {
      const valid = results.filter(Boolean);
      if (valid.length) setField("images", [...current, ...valid]);
    });
  }

  function removeImage(idx: number) {
    setField("images", (form.images ?? []).filter((_, i) => i !== idx));
  }

  function moveImage(from: number, to: number) {
    const imgs = [...(form.images ?? [])];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    setField("images", imgs);
  }

  function addDetail() {
    if (!detailInput.trim()) return;
    setField("details", [...(form.details ?? []), detailInput.trim()]);
    setDetailInput("");
  }

  function removeDetail(i: number) {
    setField("details", (form.details ?? []).filter((_, idx) => idx !== i));
  }

  function addSize() {
    if (!sizeInput.trim()) return;
    setField("sizes", [...(form.sizes ?? []), sizeInput.trim()]);
    setSizeInput("");
  }

  function removeSize(s: string) {
    setField("sizes", (form.sizes ?? []).filter(x => x !== s));
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  /* ── estilos ── */
  const inputSt: React.CSSProperties = {
    width: "100%", background: "var(--black-mid)", border: "1px solid rgba(201,168,76,0.2)",
    borderRadius: 8, padding: "9px 12px", color: "var(--white)", fontSize: 13, outline: "none",
  };
  const labelSt: React.CSSProperties = {
    display: "block", color: "var(--gray-light)", fontSize: 12, fontWeight: 600,
    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6,
  };
  const badgeSt = (on: boolean): React.CSSProperties => ({
    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
    background: on ? "rgba(76,175,80,0.15)" : "rgba(224,85,85,0.1)",
    color: on ? "#4CAF50" : "#e05555",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex" }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 220, flexShrink: 0, background: "var(--black-soft)",
        borderRight: "1px solid rgba(201,168,76,0.12)",
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
          <p style={{
            fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
            background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Painel Admin</p>
          <p style={{ color: "var(--gray-mid)", fontSize: 11, marginTop: 2 }}>{user?.name}</p>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {([
            { id: "produtos", icon: <Package size={15} />, label: "Produtos" },
            { id: "pedidos",  icon: <LayoutDashboard size={15} />, label: "Pedidos" },
          ] as { id: AdminTab; icon: React.ReactNode; label: string }[]).map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", border: "none", cursor: "pointer", borderRadius: 8,
                background: tab === item.id ? "rgba(201,168,76,0.1)" : "transparent",
                color: tab === item.id ? "var(--gold)" : "var(--gray-light)",
                fontSize: 13, marginBottom: 2,
              }}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", color: "var(--gray-mid)", fontSize: 13, textDecoration: "none", borderRadius: 8 }}>
            ← Ver loja
          </a>
          <button onClick={logout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "none", background: "transparent", color: "#e05555", fontSize: 13, cursor: "pointer", borderRadius: 8 }}>
            <LogOut size={15} />Sair
          </button>
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>

        {tab === "produtos" && (
          <>
            {/* header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ color: "var(--white)", fontSize: 20, fontWeight: 700 }}>Produtos</h1>
                <p style={{ color: "var(--gray-mid)", fontSize: 13, marginTop: 2 }}>{products.length} produtos cadastrados</p>
              </div>
              <button onClick={openNew} className="btn-gold"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={15} />Novo produto
              </button>
            </div>

            {/* busca */}
            <div style={{ position: "relative", marginBottom: 20, maxWidth: 360 }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-mid)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar produto ou categoria..."
                style={{ ...inputSt, paddingLeft: 36 }} />
            </div>

            {/* tabela */}
            <div style={{ background: "var(--black-soft)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 12, overflow: "hidden" }}>
              {/* cabeçalho */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 100px 90px", gap: 0, padding: "10px 16px", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                {["Produto", "Categoria", "Preço", "Estoque", "Status", "Ações"].map(h => (
                  <p key={h} style={{ color: "var(--gray-mid)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</p>
                ))}
              </div>

              {filtered.length === 0 && (
                <p style={{ padding: 24, color: "var(--gray-mid)", fontSize: 14, textAlign: "center" }}>Nenhum produto encontrado.</p>
              )}

              {filtered.map((p, i) => (
                <div key={p.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 100px 90px",
                  alignItems: "center", padding: "12px 16px",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(201,168,76,0.06)" : "none",
                  background: !p.active ? "rgba(255,255,255,0.01)" : "transparent",
                  opacity: !p.active ? 0.55 : 1,
                }}>
                  <div>
                    <p style={{ color: "var(--white)", fontSize: 13, fontWeight: 500 }}>{p.name}</p>
                    <p style={{ color: "var(--gray-mid)", fontSize: 11 }}>{p.subcategory}</p>
                  </div>
                  <p style={{ color: "var(--gray-light)", fontSize: 13 }}>{p.category}</p>
                  <div>
                    <p style={{ color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>
                      R$ {p.price.toFixed(2).replace(".", ",")}
                    </p>
                    {p.originalPrice && (
                      <p style={{ color: "var(--gray-mid)", fontSize: 11, textDecoration: "line-through" }}>
                        R$ {p.originalPrice.toFixed(2).replace(".", ",")}
                      </p>
                    )}
                  </div>
                  <p style={{ color: p.stock < 5 ? "#e09055" : "var(--gray-light)", fontSize: 13 }}>{p.stock}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={badgeSt(p.active)}>{p.active ? "Ativo" : "Inativo"}</span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {p.isNew && <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "rgba(201,168,76,0.15)", color: "var(--gold)", fontWeight: 700 }}>NOVO</span>}
                      {p.onSale && <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "rgba(224,85,85,0.1)", color: "#e05555", fontWeight: 700 }}>OFERTA</span>}
                      {p.featured && <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "rgba(91,155,213,0.1)", color: "#5B9BD5", fontWeight: 700 }}>DESTAQUE</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => toggleActive(p.id)} title={p.active ? "Desativar" : "Ativar"}
                      style={{ padding: 7, border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, background: "none", cursor: "pointer", color: "var(--gray-mid)" }}>
                      {p.active ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => openEdit(p)} title="Editar"
                      style={{ padding: 7, border: "1px solid rgba(201,168,76,0.2)", borderRadius: 6, background: "none", cursor: "pointer", color: "var(--gold)" }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} title="Remover"
                      style={{ padding: 7, border: "1px solid rgba(224,85,85,0.2)", borderRadius: 6, background: "none", cursor: "pointer", color: "#e05555" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "pedidos" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
            <p style={{ color: "var(--gray-mid)", fontSize: 15 }}>Gestão de pedidos — em breve.</p>
          </div>
        )}
      </div>

      {/* ── MODAL DE PRODUTO ── */}
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "32px 16px", overflowY: "auto",
        }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div style={{
            background: "var(--black-soft)", border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: 16, width: "100%", maxWidth: 640, padding: 32,
            boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
          }}>
            {/* modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ color: "var(--white)", fontSize: 18, fontWeight: 700 }}>
                {editingProduct ? "Editar produto" : "Novo produto"}
              </h2>
              <button onClick={() => setModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--gray-mid)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* nome */}
              <div>
                <label style={labelSt}>Nome do produto *</label>
                <input value={form.name} onChange={e => setField("name", e.target.value)}
                  placeholder="Ex: Argola Titânio Natural Cravejada" style={inputSt} />
              </div>

              {/* categoria + subcategoria */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelSt}>Categoria *</label>
                  <select value={form.category} onChange={e => setField("category", e.target.value)}
                    style={{ ...inputSt, cursor: "pointer" }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Subcategoria</label>
                  <input value={form.subcategory} onChange={e => setField("subcategory", e.target.value)}
                    placeholder="Ex: Argolas, Labret..." style={inputSt} />
                </div>
              </div>

              {/* material */}
              <div>
                <label style={labelSt}>Material</label>
                <input value={form.material} onChange={e => setField("material", e.target.value)}
                  placeholder="Ex: Titânio ASTM F136" style={inputSt} />
              </div>

              {/* preço + preço original + estoque */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelSt}>Preço (R$) *</label>
                  <input type="number" step="0.01" min="0" value={form.price || ""}
                    onChange={e => setField("price", parseFloat(e.target.value) || 0)} style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Preço original (R$)</label>
                  <input type="number" step="0.01" min="0"
                    value={form.originalPrice ?? ""}
                    onChange={e => setField("originalPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Deixe vazio se não tiver" style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Estoque</label>
                  <input type="number" min="0" value={form.stock || ""}
                    onChange={e => setField("stock", parseInt(e.target.value) || 0)} style={inputSt} />
                </div>
              </div>

              {/* descrição */}
              <div>
                <label style={labelSt}>Descrição</label>
                <textarea value={form.description} onChange={e => setField("description", e.target.value)}
                  placeholder="Descreva o produto..." rows={3}
                  style={{ ...inputSt, resize: "vertical" }} />
              </div>

              {/* fotos */}
              <div>
                <label style={labelSt}>Fotos do produto (máx. 5)</label>

                {/* área de drop/clique */}
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: 24, borderRadius: 10, cursor: "pointer",
                  border: "2px dashed rgba(201,168,76,0.3)",
                  background: "rgba(201,168,76,0.03)",
                  transition: "border-color 0.2s",
                }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--gold)"; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; handleImageFiles(e.dataTransfer.files); }}
                >
                  <input type="file" accept="image/*" multiple style={{ display: "none" }}
                    onChange={e => handleImageFiles(e.target.files)} />
                  <ImagePlus size={28} style={{ color: "var(--gold)", opacity: 0.6 }} />
                  <p style={{ color: "var(--gray-mid)", fontSize: 13, textAlign: "center" }}>
                    Clique para selecionar ou <strong style={{ color: "var(--gold)" }}>arraste as fotos aqui</strong>
                  </p>
                  <p style={{ color: "var(--gray-dark)", fontSize: 11 }}>PNG, JPG, WEBP — máx. 4MB cada</p>
                </label>

                {imageError && (
                  <p style={{ color: "#e05555", fontSize: 12, marginTop: 6 }}>⚠ {imageError}</p>
                )}

                {/* preview das fotos adicionadas */}
                {(form.images ?? []).length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ color: "var(--gray-mid)", fontSize: 11, marginBottom: 8 }}>
                      A primeira foto é a capa do produto. Clique nas setas para reordenar.
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(form.images ?? []).map((img, idx) => (
                        <div key={idx} style={{ position: "relative", width: 80, height: 80 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`foto ${idx + 1}`}
                            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8,
                              border: idx === 0 ? "2px solid var(--gold)" : "2px solid transparent" }} />

                          {/* badge capa */}
                          {idx === 0 && (
                            <span style={{
                              position: "absolute", top: 3, left: 3,
                              background: "var(--gold)", color: "var(--black)",
                              fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3,
                            }}>CAPA</span>
                          )}

                          {/* remover */}
                          <button onClick={() => removeImage(idx)}
                            style={{
                              position: "absolute", top: 3, right: 3,
                              background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%",
                              width: 18, height: 18, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                            <X size={10} style={{ color: "#fff" }} />
                          </button>

                          {/* mover esquerda */}
                          {idx > 0 && (
                            <button onClick={() => moveImage(idx, idx - 1)}
                              style={{
                                position: "absolute", bottom: 3, left: 3,
                                background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 4,
                                padding: "2px 5px", cursor: "pointer", color: "#fff", fontSize: 10,
                              }}>←</button>
                          )}

                          {/* mover direita */}
                          {idx < (form.images ?? []).length - 1 && (
                            <button onClick={() => moveImage(idx, idx + 1)}
                              style={{
                                position: "absolute", bottom: 3, right: 3,
                                background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 4,
                                padding: "2px 5px", cursor: "pointer", color: "#fff", fontSize: 10,
                              }}>→</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* características */}
              <div>
                <label style={labelSt}>Características</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={detailInput} onChange={e => setDetailInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addDetail())}
                    placeholder="Ex: Titânio ASTM F136 — pressione Enter" style={{ ...inputSt, flex: 1 }} />
                  <button onClick={addDetail}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", cursor: "pointer", fontSize: 13 }}>
                    +
                  </button>
                </div>
                {(form.details ?? []).map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 10px", background: "rgba(201,168,76,0.05)", borderRadius: 6 }}>
                    <Check size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
                    <span style={{ flex: 1, color: "var(--gray-light)", fontSize: 13 }}>{d}</span>
                    <button onClick={() => removeDetail(i)} style={{ background: "none", border: "none", color: "#e05555", cursor: "pointer" }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* tamanhos */}
              <div>
                <label style={labelSt}>Tamanhos disponíveis</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={sizeInput} onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSize())}
                    placeholder="Ex: 8mm — pressione Enter" style={{ ...inputSt, flex: 1 }} />
                  <button onClick={addSize}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", cursor: "pointer", fontSize: 13 }}>
                    +
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(form.sizes ?? []).map(s => (
                    <span key={s} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(201,168,76,0.1)", borderRadius: 6, color: "var(--gold)", fontSize: 12 }}>
                      {s}
                      <button onClick={() => removeSize(s)} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* flags */}
              <div>
                <label style={labelSt}>Visibilidade e destaques</label>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {([
                    { key: "active",   label: "Ativo (visível na loja)" },
                    { key: "featured", label: "Destaque" },
                    { key: "isNew",    label: "Lançamento" },
                    { key: "onSale",   label: "Oferta da semana" },
                  ] as { key: keyof typeof form; label: string }[]).map(flag => (
                    <label key={flag.key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--gray-light)", fontSize: 13 }}>
                      <input type="checkbox" checked={!!form[flag.key]}
                        onChange={e => setField(flag.key, e.target.checked)}
                        style={{ accentColor: "var(--gold)", cursor: "pointer" }} />
                      {flag.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* botões */}
              <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
                <button onClick={saveProduct} className="btn-gold"
                  style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {saved ? <><Check size={16} />Salvo!</> : (editingProduct ? "Salvar alterações" : "Criar produto")}
                </button>
                <button onClick={() => setModalOpen(false)}
                  style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.2)", background: "transparent", color: "var(--gray-light)", fontSize: 14, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
