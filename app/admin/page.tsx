"use client";

import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { useAuth } from "@/lib/auth-mock";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Package,
  LayoutDashboard, LogOut, Search, X, Check, ImagePlus, Loader2,
} from "lucide-react";

type Category = { id: string; name: string; slug: string };

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  category_id: string;
  subcategory: string | null;
  material: string | null;
  description: string | null;
  details: string[] | null;
  stock: number;
  sizes: string[] | null;
  sides: string[] | null;
  featured: boolean;
  is_new: boolean;
  on_sale: boolean;
  active: boolean;
  created_at: string;
  sale_ends_at?: string | null;
  categories?: { name: string; slug: string };
  product_images?: { id: string; url: string; sort_order: number }[];
};

type ProductForm = {
  name: string;
  price: string;
  original_price: string;
  category_id: string;
  subcategory: string;
  material: string;
  description: string;
  details: string[];
  stock: string;
  sizes: string[];
  sides: string[];
  colors: string[];
  featured: boolean;
  is_new: boolean;
  on_sale: boolean;
  active: boolean;
  in_stock: boolean;
  sale_duration: string;  // "" | "3" | "7" | "15" | "30" (dias)
};

const EMPTY_FORM: ProductForm = {
  name: "", price: "", original_price: "",
  category_id: "", subcategory: "", material: "",
  description: "", details: [], stock: "0", sizes: [], sides: [], colors: [],
  featured: false, is_new: false, on_sale: false, active: true, in_stock: true, sale_duration: "7",
};

type AdminTab = "produtos" | "pedidos";

export default function AdminPage() {
  const { user, loggedIn, loading: authLoading, logout } = useAuth();
  const [tab,        setTab]        = useState<AdminTab>("produtos");
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbLoading,  setDbLoading]  = useState(true);
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "inativos">("todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Product | null>(null);
  const [form,       setForm]       = useState<ProductForm>(EMPTY_FORM);
  const [detailInput, setDetailInput] = useState("");
  const [sizeInput,   setSizeInput]   = useState("");
  const [sideInput,   setSideInput]   = useState("");
  const [colorInput,  setColorInput]  = useState("");
  const [subCorrection, setSubCorrection] = useState<string | null>(null);

  /* ── auto-corrige ou cria subcategoria ── */
  function resolveSubcategory(input: string): string {
    const existing = [...new Set(products.map(p => p.subcategory).filter(Boolean))] as string[];
    if (!input.trim() || existing.length === 0) return input;

    const fuse = new Fuse(existing, { threshold: 0.2, includeScore: true });
    const results = fuse.search(input);

    if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.2) {
      // Similaridade alta — corrige automaticamente
      return results[0].item;
    }
    // Sem similaridade — aceita como nova subcategoria
    return input;
  }

  function handleSubcategoryBlur(value: string) {
    if (!value.trim()) return;
    const resolved = resolveSubcategory(value);
    if (resolved !== value) {
      setSubCorrection(resolved);
      setForm(p => ({ ...p, subcategory: resolved }));
    } else {
      setSubCorrection(null);
    }
  }
  const [saving,      setSaving]      = useState(false);
  const [saveOk,      setSaveOk]      = useState(false);
  const [imageFiles,  setImageFiles]  = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; sort_order: number }[]>([]);
  const [imageError, setImageError]  = useState("");
  const [formError,  setFormError]   = useState("");

  /* ── carregar dados ── */
  const loadProducts = useCallback(async () => {
    setDbLoading(true);
    const supabase = createClient();
    try {
      // busca em lotes de 1.000 — sem isso o admin só mostra os primeiros 1.000
      const data = await fetchAllRows((from, to) =>
        supabase
          .from("products")
          .select("*, categories(name, slug), product_images(id, url, sort_order)")
          .order("created_at", { ascending: false })
          .range(from, to)
      );
      setProducts((data as Product[]) ?? []);
    } catch (e) {
      console.error("loadProducts:", e);
      setProducts([]);
    } finally {
      setDbLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("id, name, slug").order("sort_order");
    setCategories((data as Category[]) ?? []);
  }, []);

  useEffect(() => {
    if (loggedIn) {
      loadProducts();
      loadCategories();
    }
  }, [loggedIn, loadProducts, loadCategories]);

  /* ── guards ── */
  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!loggedIn) return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <p style={{ color: "var(--gray-mid)" }}>Acesso restrito.</p>
      <a href="/login" style={{ color: "var(--gold)", fontSize: 14 }}>← Fazer login</a>
    </div>
  );
  if (user?.role !== "admin") return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <p style={{ color: "var(--gray-mid)" }}>Você não tem permissão.</p>
      <a href="/" style={{ color: "var(--gold)", fontSize: 14 }}>← Voltar à loja</a>
    </div>
  );

  /* ── modal helpers ── */
  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? "", in_stock: true, colors: [], sale_duration: "7" });
    setImageFiles([]); setImagePreviews([]); setExistingImages([]);
    setDetailInput(""); setSizeInput(""); setSideInput(""); setColorInput(""); setSubCorrection(null); setFormError(""); setImageError("");
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name:           p.name,
      price:          String(p.price),
      original_price: p.original_price ? String(p.original_price) : "",
      category_id:    p.category_id,
      subcategory:    p.subcategory ?? "",
      material:       p.material ?? "",
      description:    p.description ?? "",
      details:        p.details ?? [],
      stock:          String(p.stock),
      sizes:          p.sizes ?? [],
      sides:          p.sides ?? [],
      colors:         (p as Product & { colors?: string[] }).colors ?? [],
      featured:       p.featured,
      is_new:         p.is_new,
      on_sale:        p.on_sale,
      active:         p.active,
      in_stock:       p.stock !== 0,
      sale_duration:  "7",
    });
    const imgs = [...(p.product_images ?? [])].sort((a,b) => a.sort_order - b.sort_order);
    setExistingImages(imgs);
    setImageFiles([]); setImagePreviews([]);
    setDetailInput(""); setSizeInput(""); setSideInput(""); setColorInput(""); setSubCorrection(null); setFormError(""); setImageError("");
    setModalOpen(true);
  }

  /* ── imagens ── */
  function handleImageFiles(files: FileList | null) {
    if (!files) return;
    setImageError("");
    const total = existingImages.length + imageFiles.length + files.length;
    if (total > 10) { setImageError("Máximo de 10 fotos por produto."); return; }
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) { setImageError("Apenas imagens."); return; }
      if (file.size > 4 * 1024 * 1024) { setImageError("Máximo 4MB por foto."); return; }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });
    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  }

  async function deleteExistingImage(img: { id: string; url: string }) {
    const supabase = createClient();
    const path = img.url.split("/product-images/")[1];
    if (path) await supabase.storage.from("product-images").remove([path]);
    await supabase.from("product_images").delete().eq("id", img.id);
    setExistingImages(prev => prev.filter(i => i.id !== img.id));
  }

  /* ── salvar produto ── */
  async function saveProduct() {
    if (!form.name.trim()) { setFormError("Nome obrigatório."); return; }
    if (!form.price || isNaN(Number(form.price))) { setFormError("Preço inválido."); return; }
    if (!form.category_id) { setFormError("Selecione uma categoria."); return; }

    // ── checa nome duplicado (ignora o próprio produto quando editando) ──
    const normalizedName = form.name.trim().toLowerCase();
    const duplicate = products.find(p =>
      p.name.trim().toLowerCase() === normalizedName && p.id !== editing?.id
    );
    if (duplicate) {
      setFormError(`Já existe um produto chamado "${duplicate.name}". Escolha um nome diferente.`);
      return;
    }

    setSaving(true); setFormError("");

    try {
      const supabase = createClient();
      const slug = form.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        + "-" + Date.now().toString(36);

      const saleEndsAt = form.on_sale && form.sale_duration
        ? new Date(Date.now() + Number(form.sale_duration) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const payload = {
        name:           form.name.trim(),
        slug:           editing?.slug ?? slug,
        price:          Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        category_id:    form.category_id,
        subcategory:    form.subcategory || null,
        material:       form.material || null,
        description:    form.description || null,
        details:        form.details.length ? form.details : null,
        sizes:          form.sizes.length ? form.sizes : null,
        sides:          form.sides.length ? form.sides : null,
        colors:         form.colors.length ? form.colors : null,
        sale_ends_at:   saleEndsAt,
        featured:       form.featured,
        is_new:         form.is_new,
        on_sale:        form.on_sale,
        active:         form.active,
        stock:          form.in_stock ? 1 : 0,  // 0 = esgotado, 1 = disponível
        updated_at:     new Date().toISOString(),
      };

      let productId = editing?.id;

      if (editing) {
        await supabase.from("products").update(payload as never).eq("id", editing.id);
      } else {
        const { data, error } = await supabase.from("products").insert(payload as never).select("id").single();
        if (error) throw new Error(error.message);
        productId = (data as { id: string }).id;
      }

      /* upload das novas fotos */
      const sortStart = existingImages.length;
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext  = file.name.split(".").pop();
        const path = `${productId}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
        if (upErr) throw new Error(upErr.message);
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        await supabase.from("product_images").insert({
          product_id: productId, url: publicUrl, sort_order: sortStart + i,
        } as never);
      }

      setSaveOk(true);
      setTimeout(() => { setSaveOk(false); setModalOpen(false); loadProducts(); }, 800);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  /* ── ações na tabela ── */
  async function toggleActive(p: Product) {
    const supabase = createClient();
    await supabase.from("products").update({ active: !p.active } as never).eq("id", p.id);
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
  }

  async function deleteProduct(id: string) {
    if (!confirm("Remover este produto permanentemente?")) return;
    const supabase = createClient();
    // imagens são deletadas em cascata pelo banco (on delete cascade)
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  /* ── seleção ── */
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  }

  /* ── bulk actions ── */
  async function bulkSetActive(active: boolean) {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    const supabase = createClient();
    await supabase.from("products").update({ active } as never).in("id", ids);
    setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, active } : p));
    setSelectedIds(new Set());
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Remover ${selectedIds.size} produto(s) permanentemente? Essa ação não pode ser desfeita.`)) return;
    const ids = [...selectedIds];
    const supabase = createClient();
    await supabase.from("products").delete().in("id", ids);
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
    setSelectedIds(new Set());
  }

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.categories?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" ? true :
      statusFilter === "ativos" ? p.active :
      !p.active;
    return matchesSearch && matchesStatus;
  });

  /* ── estilos ── */
  const inputSt: React.CSSProperties = {
    width: "100%", background: "var(--black-mid)",
    border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8,
    padding: "9px 12px", color: "var(--white)", fontSize: 13, outline: "none",
  };
  const labelSt: React.CSSProperties = {
    display: "block", color: "var(--gray-light)", fontSize: 12,
    fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6,
  };

  return (
    <div className="flex flex-col lg:flex-row" style={{ minHeight: "100vh", background: "var(--black)" }}>

      {/* ── SIDEBAR (desktop) / TOPBAR (mobile) ── */}
      <div className="w-full lg:w-[220px] flex-row lg:flex-col lg:sticky lg:top-0 lg:h-screen"
        style={{ flexShrink: 0, background: "var(--black-soft)", borderBottom: "1px solid rgba(201,168,76,0.12)", display: "flex" }}>
        <div className="lg:border-b" style={{ padding: "14px 16px", borderBottom: "1px solid rgba(201,168,76,0.1)", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, background: "linear-gradient(135deg,#8B6914,#C9A84C,#F5E0A0,#C9A84C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Painel Admin</p>
          <p className="hidden lg:block" style={{ color: "var(--gray-mid)", fontSize: 11, marginTop: 2 }}>{user?.name ?? user?.email}</p>
        </div>
        <nav className="flex lg:flex-col" style={{ flex: 1, padding: "8px", overflowX: "auto" }}>
          {([
            { id: "produtos", icon: <Package size={15} />,       label: "Produtos" },
            { id: "pedidos",  icon: <LayoutDashboard size={15} />, label: "Pedidos"  },
          ] as { id: AdminTab; icon: React.ReactNode; label: string }[]).map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", cursor: "pointer", borderRadius: 8, background: tab === item.id ? "rgba(201,168,76,0.1)" : "transparent", color: tab === item.id ? "var(--gold)" : "var(--gray-light)", fontSize: 13, marginRight: 4 }}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
        <div className="hidden lg:block" style={{ padding: "12px 8px", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", color: "var(--gray-mid)", fontSize: 13, textDecoration: "none", borderRadius: 8 }}>← Ver loja</a>
          <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "none", background: "transparent", color: "#e05555", fontSize: 13, cursor: "pointer", borderRadius: 8 }}>
            <LogOut size={15} />Sair
          </button>
        </div>
        {/* Sair compacto no mobile */}
        <button onClick={logout} className="lg:hidden" style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "0 14px", border: "none", background: "transparent", color: "#e05555", cursor: "pointer" }}>
          <LogOut size={16} />
        </button>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="px-4 sm:px-6 lg:px-8" style={{ flex: 1, paddingTop: 24, paddingBottom: 24, overflowY: "auto", overflowX: "hidden" }}>
        {tab === "produtos" && (
          <>
            <div className="flex-wrap gap-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ color: "var(--white)", fontSize: 20, fontWeight: 700 }}>Produtos</h1>
                <p style={{ color: "var(--gray-mid)", fontSize: 13, marginTop: 2 }}>{products.length} cadastrados</p>
              </div>
              <button onClick={openNew} className="btn-gold"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={15} />Novo produto
              </button>
            </div>

            {/* busca + filtro de status */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 360 }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-mid)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
                  style={{ ...inputSt, paddingLeft: 36 }} />
              </div>

              {/* filtro ativo/inativo */}
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  { value: "todos",    label: "Todos",    count: products.length },
                  { value: "ativos",   label: "Ativos",   count: products.filter(p => p.active).length },
                  { value: "inativos", label: "Inativos", count: products.filter(p => !p.active).length },
                ] as { value: typeof statusFilter; label: string; count: number }[]).map(opt => (
                  <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                      background: statusFilter === opt.value
                        ? opt.value === "inativos" ? "rgba(224,85,85,0.15)" : "rgba(201,168,76,0.15)"
                        : "var(--black-mid)",
                      color: statusFilter === opt.value
                        ? opt.value === "inativos" ? "#e05555" : "var(--gold)"
                        : "var(--gray-mid)",
                      outline: statusFilter === opt.value
                        ? `1px solid ${opt.value === "inativos" ? "rgba(224,85,85,0.4)" : "rgba(201,168,76,0.4)"}`
                        : "1px solid rgba(255,255,255,0.06)",
                    }}>
                    {opt.label}
                    <span style={{
                      background: statusFilter === opt.value
                        ? opt.value === "inativos" ? "rgba(224,85,85,0.25)" : "rgba(201,168,76,0.25)"
                        : "rgba(255,255,255,0.08)",
                      borderRadius: 4, padding: "1px 5px", fontSize: 11,
                    }}>
                      {opt.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* barra de bulk actions — aparece quando tem itens selecionados */}
            {selectedIds.size > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                padding: "10px 16px", marginBottom: 12, borderRadius: 10,
                background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)",
              }}>
                <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 600, flex: 1 }}>
                  {selectedIds.size} produto{selectedIds.size > 1 ? "s" : ""} selecionado{selectedIds.size > 1 ? "s" : ""}
                </span>
                <button onClick={() => bulkSetActive(true)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(76,175,80,0.15)", color: "#4CAF50", fontSize: 12, fontWeight: 600 }}>
                  <Eye size={13} /> Ativar todos
                </button>
                <button onClick={() => bulkSetActive(false)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(224,85,85,0.1)", color: "#e05555", fontSize: 12, fontWeight: 600 }}>
                  <EyeOff size={13} /> Desativar todos
                </button>
                <button onClick={bulkDelete}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(224,85,85,0.15)", color: "#e05555", fontSize: 12, fontWeight: 600 }}>
                  <Trash2 size={13} /> Remover todos
                </button>
                <button onClick={() => setSelectedIds(new Set())}
                  style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "none", cursor: "pointer", color: "var(--gray-mid)", fontSize: 12 }}>
                  <X size={13} />
                </button>
              </div>
            )}

            {dbLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                <Loader2 size={32} style={{ color: "var(--gold)", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : (
              <>
                {/* ── TABELA (desktop) ── */}
                <div className="hidden md:block" style={{ background: "var(--black-soft)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "32px 2fr 1fr 1fr 80px 110px 100px", padding: "10px 16px", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input type="checkbox"
                        checked={filtered.length > 0 && selectedIds.size === filtered.length}
                        onChange={toggleSelectAll}
                        style={{ accentColor: "var(--gold)", cursor: "pointer", width: 14, height: 14 }} />
                    </div>
                    {["Produto","Categoria","Preço","Disponível","Status","Ações"].map(h => (
                      <p key={h} style={{ color: "var(--gray-mid)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</p>
                    ))}
                  </div>
                  {filtered.length === 0 && (
                    <p style={{ padding: 24, color: "var(--gray-mid)", fontSize: 14, textAlign: "center" }}>
                      {products.length === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum resultado."}
                    </p>
                  )}
                  {filtered.map((p, i) => (
                    <div key={p.id} style={{ display: "grid", gridTemplateColumns: "32px 2fr 1fr 1fr 80px 110px 100px", alignItems: "center", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(201,168,76,0.06)" : "none", opacity: !p.active ? 0.5 : 1, background: selectedIds.has(p.id) ? "rgba(201,168,76,0.05)" : "transparent" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <input type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          style={{ accentColor: "var(--gold)", cursor: "pointer", width: 14, height: 14 }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 6, flexShrink: 0, background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {p.product_images?.[0]
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.product_images.sort((a,b) => a.sort_order - b.sort_order)[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 20 }}>💍</span>
                          }
                        </div>
                        <div>
                          <p style={{ color: "var(--white)", fontSize: 13, fontWeight: 500 }}>{p.name}</p>
                          <p style={{ color: "var(--gray-mid)", fontSize: 11 }}>{p.subcategory}</p>
                        </div>
                      </div>
                      <p style={{ color: "var(--gray-light)", fontSize: 13 }}>{p.categories?.name}</p>
                      <div>
                        <p style={{ color: "var(--gold)", fontSize: 13, fontWeight: 600 }}>R$ {p.price.toFixed(2).replace(".",",")}</p>
                        {p.original_price && p.original_price > p.price && <p style={{ color: "var(--gray-mid)", fontSize: 11, textDecoration: "line-through" }}>R$ {p.original_price.toFixed(2).replace(".",",")}</p>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: p.stock > 0 ? "rgba(76,175,80,0.15)" : "rgba(224,85,85,0.1)", color: p.stock > 0 ? "#4CAF50" : "#e05555" }}>
                        {p.stock > 0 ? "Disponível" : "Esgotado"}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: p.active ? "rgba(76,175,80,0.15)" : "rgba(224,85,85,0.1)", color: p.active ? "#4CAF50" : "#e05555" }}>
                          {p.active ? "Ativo" : "Inativo"}
                        </span>
                        <div style={{ display: "flex", gap: 3 }}>
                          {p.is_new    && <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: "rgba(201,168,76,0.15)", color: "var(--gold)", fontWeight: 700 }}>NOVO</span>}
                          {p.on_sale   && (
                            <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: "rgba(224,85,85,0.1)", color: "#e05555", fontWeight: 700 }}>
                              OFERTA{p.sale_ends_at ? ` · ${Math.max(0, Math.ceil((new Date(p.sale_ends_at).getTime() - Date.now()) / 86400000))}d` : ""}
                            </span>
                          )}
                          {p.featured  && <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 3, background: "rgba(91,155,213,0.1)", color: "#5B9BD5", fontWeight: 700 }}>DEST.</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => toggleActive(p)} title={p.active ? "Desativar" : "Ativar"}
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

                {/* ── CARDS (mobile) ── */}
                <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* selecionar todos no mobile */}
                  {filtered.length > 0 && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", cursor: "pointer", color: "var(--gray-mid)", fontSize: 13 }}>
                      <input type="checkbox"
                        checked={selectedIds.size === filtered.length}
                        onChange={toggleSelectAll}
                        style={{ accentColor: "var(--gold)", cursor: "pointer", width: 16, height: 16 }} />
                      Selecionar todos ({filtered.length})
                    </label>
                  )}
                  {filtered.length === 0 && (
                    <p style={{ padding: 24, color: "var(--gray-mid)", fontSize: 14, textAlign: "center", background: "var(--black-soft)", borderRadius: 12 }}>
                      {products.length === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum resultado."}
                    </p>
                  )}
                  {filtered.map(p => (
                    <div key={p.id} style={{ border: `1px solid ${selectedIds.has(p.id) ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.12)"}`, borderRadius: 12, padding: 14, opacity: !p.active ? 0.6 : 1, background: selectedIds.has(p.id) ? "rgba(201,168,76,0.05)" : "var(--black-soft)" }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        {/* checkbox no mobile */}
                        <div style={{ display: "flex", alignItems: "flex-start", paddingTop: 2 }}>
                          <input type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            style={{ accentColor: "var(--gold)", cursor: "pointer", width: 16, height: 16 }} />
                        </div>
                        <div style={{ width: 52, height: 52, borderRadius: 8, flexShrink: 0, background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {p.product_images?.[0]
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.product_images.sort((a,b) => a.sort_order - b.sort_order)[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 22 }}>💍</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: "var(--white)", fontSize: 14, fontWeight: 600 }}>{p.name}</p>
                          <p style={{ color: "var(--gray-mid)", fontSize: 12 }}>{p.categories?.name}{p.subcategory ? ` · ${p.subcategory}` : ""}</p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                            <p style={{ color: "var(--gold)", fontSize: 14, fontWeight: 700 }}>R$ {p.price.toFixed(2).replace(".",",")}</p>
                            {p.original_price && p.original_price > p.price && <p style={{ color: "var(--gray-mid)", fontSize: 11, textDecoration: "line-through" }}>R$ {p.original_price.toFixed(2).replace(".",",")}</p>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: p.stock > 0 ? "rgba(76,175,80,0.15)" : "rgba(224,85,85,0.1)", color: p.stock > 0 ? "#4CAF50" : "#e05555" }}>
                          {p.stock > 0 ? "Disponível" : "Esgotado"}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: p.active ? "rgba(76,175,80,0.15)" : "rgba(224,85,85,0.1)", color: p.active ? "#4CAF50" : "#e05555" }}>
                          {p.active ? "Ativo" : "Inativo"}
                        </span>
                        {p.is_new  && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(201,168,76,0.15)", color: "var(--gold)", fontWeight: 700 }}>NOVO</span>}
                        {p.on_sale && (
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(224,85,85,0.1)", color: "#e05555", fontWeight: 700 }}>
                            OFERTA{p.sale_ends_at ? ` · ${Math.max(0, Math.ceil((new Date(p.sale_ends_at).getTime() - Date.now()) / 86400000))}d` : ""}
                          </span>
                        )}
                        {p.featured && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(91,155,213,0.1)", color: "#5B9BD5", fontWeight: 700 }}>DEST.</span>}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleActive(p)}
                          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, background: "none", cursor: "pointer", color: "var(--gray-mid)", fontSize: 12 }}>
                          {p.active ? <EyeOff size={13} /> : <Eye size={13} />} {p.active ? "Desativar" : "Ativar"}
                        </button>
                        <button onClick={() => openEdit(p)}
                          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, background: "none", cursor: "pointer", color: "var(--gold)", fontSize: 12 }}>
                          <Edit2 size={13} /> Editar
                        </button>
                        <button onClick={() => deleteProduct(p.id)}
                          style={{ padding: "8px 12px", border: "1px solid rgba(224,85,85,0.2)", borderRadius: 8, background: "none", cursor: "pointer", color: "#e05555" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === "pedidos" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
            <p style={{ color: "var(--gray-mid)", fontSize: 15 }}>Gestão de pedidos — em breve.</p>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div className="px-2 sm:px-4" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 24, paddingBottom: 24, overflowY: "auto" }}>
          <div className="p-5 sm:p-8" style={{ background: "var(--black-soft)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 16, width: "100%", maxWidth: 640, boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ color: "var(--white)", fontSize: 18, fontWeight: 700 }}>
                {editing ? "Editar produto" : "Novo produto"}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", color: "var(--gray-mid)", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* nome */}
              <div>
                <label style={labelSt}>Nome *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Argola Titânio Natural" style={inputSt} />
                {form.name.trim() && products.some(p =>
                  p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p.id !== editing?.id
                ) && (
                  <p style={{ fontSize: 11, color: "#e05555", marginTop: 4 }}>
                    ⚠ Já existe um produto com esse nome
                  </p>
                )}
              </div>

              {/* categoria + subcategoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <div>
                  <label style={labelSt}>Categoria *</label>
                  <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                    style={{ ...inputSt, cursor: "pointer" }}>
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Subcategoria</label>
                  <input
                    list="subcategoria-options"
                    value={form.subcategory}
                    onChange={e => { setForm(p => ({ ...p, subcategory: e.target.value })); setSubCorrection(null); }}
                    onBlur={e => handleSubcategoryBlur(e.target.value)}
                    placeholder="Ex: Argolas, Labret, Septo..."
                    style={inputSt}
                  />
                  <datalist id="subcategoria-options">
                    {[...new Set(products.map(p => p.subcategory).filter(Boolean))].sort().map(s => (
                      <option key={s} value={s ?? ""} />
                    ))}
                  </datalist>
                  {subCorrection && (
                    <p style={{ fontSize: 11, marginTop: 4, color: "#C9A84C" }}>
                      ✏ Corrigido automaticamente para <strong>{subCorrection}</strong>
                    </p>
                  )}
                  {form.subcategory && !subCorrection && ![...new Set(products.map(p => p.subcategory).filter(Boolean))].includes(form.subcategory) && (
                    <p style={{ fontSize: 11, marginTop: 4, color: "#4CAF50" }}>
                      ✨ Nova subcategoria: <strong>{form.subcategory}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* material */}
              <div>
                <label style={labelSt}>Material</label>
                <input value={form.material} onChange={e => setForm(p => ({ ...p, material: e.target.value }))} placeholder="Ex: Titânio ASTM F136" style={inputSt} />
              </div>

              {/* preço + original */}
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <div>
                  <label style={labelSt}>Preço (R$) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Preço original</label>
                  <input type="number" step="0.01" min="0" value={form.original_price} onChange={e => setForm(p => ({ ...p, original_price: e.target.value }))} placeholder="Sem desconto" style={inputSt} />
                </div>
              </div>

              {/* descrição */}
              <div>
                <label style={labelSt}>Descrição</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Descreva o produto..." style={{ ...inputSt, resize: "vertical" }} />
              </div>

              {/* características */}
              <div>
                <label style={labelSt}>Características</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={detailInput} onChange={e => setDetailInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (detailInput.trim()) { setForm(p => ({ ...p, details: [...p.details, detailInput.trim()] })); setDetailInput(""); } } }}
                    placeholder="Pressione Enter para adicionar" style={{ ...inputSt, flex: 1 }} />
                  <button onClick={() => { if (detailInput.trim()) { setForm(p => ({ ...p, details: [...p.details, detailInput.trim()] })); setDetailInput(""); } }}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", cursor: "pointer", fontSize: 13 }}>+</button>
                </div>
                {form.details.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, padding: "6px 10px", background: "rgba(201,168,76,0.05)", borderRadius: 6 }}>
                    <Check size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
                    <span style={{ flex: 1, color: "var(--gray-light)", fontSize: 13 }}>{d}</span>
                    <button onClick={() => setForm(p => ({ ...p, details: p.details.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", color: "#e05555", cursor: "pointer" }}><X size={12} /></button>
                  </div>
                ))}
              </div>

              {/* tamanhos */}
              <div>
                <label style={labelSt}>Tamanhos</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={sizeInput} onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (sizeInput.trim()) { setForm(p => ({ ...p, sizes: [...p.sizes, sizeInput.trim()] })); setSizeInput(""); } } }}
                    placeholder="Ex: 8mm — Enter para adicionar" style={{ ...inputSt, flex: 1 }} />
                  <button onClick={() => { if (sizeInput.trim()) { setForm(p => ({ ...p, sizes: [...p.sizes, sizeInput.trim()] })); setSizeInput(""); } }}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", cursor: "pointer", fontSize: 13 }}>+</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.sizes.map(s => (
                    <span key={s} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(201,168,76,0.1)", borderRadius: 6, color: "var(--gold)", fontSize: 12 }}>
                      {s}
                      <button onClick={() => setForm(p => ({ ...p, sizes: p.sizes.filter(x => x !== s) }))} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* lados */}
              <div>
                <label style={labelSt}>Lados (opcional)</label>
                <p style={{ color: "var(--gray-dark)", fontSize: 11, marginBottom: 8 }}>Deixe vazio se o produto não tem versão de lado</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Direito", "Esquerdo", "Orelha Direita", "Orelha Esquerda"].map(side => (
                    <button key={side} type="button"
                      onClick={() => setForm(p => ({
                        ...p,
                        sides: p.sides.includes(side)
                          ? p.sides.filter(s => s !== side)
                          : [...p.sides, side],
                      }))}
                      style={{
                        padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                        border: form.sides.includes(side) ? "2px solid var(--gold)" : "1px solid rgba(201,168,76,0.2)",
                        background: form.sides.includes(side) ? "rgba(201,168,76,0.1)" : "transparent",
                        color: form.sides.includes(side) ? "var(--gold)" : "var(--gray-mid)",
                        fontWeight: form.sides.includes(side) ? 600 : 400,
                      }}>
                      {side}
                    </button>
                  ))}
                </div>
                {form.sides.length > 0 && (
                  <p style={{ color: "var(--gray-mid)", fontSize: 11, marginTop: 6 }}>
                    Selecionados: {form.sides.join(", ")}
                  </p>
                )}
              </div>

              {/* lados */}
              <div>
                <label style={labelSt}>Lados <span style={{ color: "var(--gray-dark)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional — apenas se o produto tiver versão por lado)</span></label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={sideInput} onChange={e => setSideInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (sideInput.trim()) { setForm(p => ({ ...p, sides: [...p.sides, sideInput.trim()] })); setSideInput(""); } } }}
                    placeholder='Ex: Direito, Esquerdo — Enter para adicionar' style={{ ...inputSt, flex: 1 }} />
                  <button onClick={() => { if (sideInput.trim()) { setForm(p => ({ ...p, sides: [...p.sides, sideInput.trim()] })); setSideInput(""); } }}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", cursor: "pointer", fontSize: 13 }}>+</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.sides.map(s => (
                    <span key={s} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(201,168,76,0.1)", borderRadius: 6, color: "var(--gold)", fontSize: 12 }}>
                      {s}
                      <button onClick={() => setForm(p => ({ ...p, sides: p.sides.filter(x => x !== s) }))} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                {form.sides.length === 0 && (
                  <p style={{ color: "var(--gray-dark)", fontSize: 11, marginTop: 4 }}>Nenhum lado cadastrado — produto não terá seletor de lado.</p>
                )}
              </div>

              {/* cores */}
              <div>
                <label style={labelSt}>Cores / Pedras <span style={{ color: "var(--gray-dark)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input value={colorInput} onChange={e => setColorInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (colorInput.trim()) { setForm(p => ({ ...p, colors: [...p.colors, colorInput.trim()] })); setColorInput(""); } } }}
                    placeholder='Ex: Azul, Rosa, Cristal — Enter para adicionar' style={{ ...inputSt, flex: 1 }} />
                  <button onClick={() => { if (colorInput.trim()) { setForm(p => ({ ...p, colors: [...p.colors, colorInput.trim()] })); setColorInput(""); } }}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "var(--gold)", cursor: "pointer", fontSize: 13 }}>+</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.colors.map(col => (
                    <span key={col} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(201,168,76,0.1)", borderRadius: 6, color: "var(--gold)", fontSize: 12 }}>
                      {col}
                      <button onClick={() => setForm(p => ({ ...p, colors: p.colors.filter(x => x !== col) }))} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                {form.colors.length === 0 && (
                  <p style={{ color: "var(--gray-dark)", fontSize: 11, marginTop: 4 }}>Nenhuma cor cadastrada — produto não terá seletor de cor/pedra.</p>
                )}
              </div>

              {/* fotos */}
              <div>
                <label style={labelSt}>Fotos (máx. 10)</label>
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20, borderRadius: 10, cursor: "pointer", border: "2px dashed rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.03)" }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--gold)"; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; handleImageFiles(e.dataTransfer.files); }}>
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleImageFiles(e.target.files)} />
                  <ImagePlus size={24} style={{ color: "var(--gold)", opacity: 0.6 }} />
                  <p style={{ color: "var(--gray-mid)", fontSize: 13, textAlign: "center" }}>Clique ou arraste as fotos aqui</p>
                  <p style={{ color: "var(--gray-dark)", fontSize: 11 }}>PNG, JPG, WEBP — máx. 4MB cada</p>
                </label>
                {imageError && <p style={{ color: "#e05555", fontSize: 12, marginTop: 6 }}>⚠ {imageError}</p>}

                {/* fotos existentes */}
                {existingImages.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ color: "var(--gray-mid)", fontSize: 11, marginBottom: 6 }}>Fotos salvas:</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {existingImages.map((img, idx) => (
                        <div key={img.id} style={{ position: "relative", width: 72, height: 72 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: idx === 0 ? "2px solid var(--gold)" : "2px solid transparent" }} />
                          {idx === 0 && <span style={{ position: "absolute", top: 3, left: 3, background: "var(--gold)", color: "var(--black)", fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3 }}>CAPA</span>}
                          <button onClick={() => deleteExistingImage(img)} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X size={10} style={{ color: "#fff" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* novas fotos */}
                {imagePreviews.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ color: "var(--gray-mid)", fontSize: 11, marginBottom: 6 }}>Novas fotos a adicionar:</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {imagePreviews.map((url, idx) => (
                        <div key={idx} style={{ position: "relative", width: 72, height: 72 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "2px solid rgba(201,168,76,0.3)" }} />
                          <button onClick={() => { setImageFiles(p => p.filter((_, i) => i !== idx)); setImagePreviews(p => p.filter((_, i) => i !== idx)); }}
                            style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X size={10} style={{ color: "#fff" }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* flags */}
              <div>
                <label style={labelSt}>Destaques</label>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {([
                    { key: "active",   label: "Ativo (visível na loja)" },
                    { key: "featured", label: "Destaque" },
                    { key: "is_new",   label: "Lançamento" },
                    { key: "on_sale",  label: "Oferta" },
                    { key: "in_stock", label: "Em estoque (desmarque se esgotado)" },
                  ] as { key: keyof ProductForm; label: string }[]).map(flag => (
                    <label key={flag.key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--gray-light)", fontSize: 13 }}>
                      <input type="checkbox" checked={!!form[flag.key]} onChange={e => setForm(p => ({ ...p, [flag.key]: e.target.checked }))} style={{ accentColor: "var(--gold)", cursor: "pointer" }} />
                      {flag.label}
                    </label>
                  ))}
                </div>

                {/* aviso lançamento — expira automático em 7 dias */}
                {form.is_new && (
                  <p style={{ fontSize: 11, color: "var(--gold)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    ⏱ Lançamentos saem automaticamente da aba "Lançamentos" 7 dias após a criação.
                  </p>
                )}

                {/* duração da oferta — só aparece se "Oferta" estiver marcado */}
                {form.on_sale && (
                  <div style={{ marginTop: 12, padding: 14, background: "rgba(201,168,76,0.06)", borderRadius: 8, border: "1px solid rgba(201,168,76,0.15)" }}>
                    <label style={labelSt}>Duração da oferta</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { value: "1",  label: "1 dia"     },
                        { value: "3",  label: "3 dias"    },
                        { value: "7",  label: "7 dias"    },
                        { value: "15", label: "15 dias"   },
                        { value: "30", label: "30 dias"   },
                        { value: "",   label: "Sem prazo" },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setForm(p => ({ ...p, sale_duration: opt.value }))}
                          style={{
                            padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                            border: form.sale_duration === opt.value ? "2px solid var(--gold)" : "1px solid rgba(201,168,76,0.2)",
                            background: form.sale_duration === opt.value ? "rgba(201,168,76,0.12)" : "transparent",
                            color: form.sale_duration === opt.value ? "var(--gold)" : "var(--gray-mid)",
                            fontWeight: form.sale_duration === opt.value ? 600 : 400,
                          }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--gray-mid)", marginTop: 8 }}>
                      {form.sale_duration
                        ? `A oferta expira automaticamente em ${form.sale_duration} dia${form.sale_duration === "1" ? "" : "s"}.`
                        : "A oferta fica ativa até você desmarcá-la manualmente."}
                    </p>
                  </div>
                )}
              </div>

              {formError && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  color: "#e05555", fontSize: 13, fontWeight: 500,
                  background: "rgba(224,85,85,0.12)", border: "1px solid rgba(224,85,85,0.3)",
                  padding: "12px 16px", borderRadius: 10,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* botões */}
              <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
                <button onClick={saveProduct} disabled={saving} className="btn-gold"
                  style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.7 : 1 }}>
                  {saving ? <><Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} />Salvando...</>
                   : saveOk ? <><Check size={15} />Salvo!</>
                   : editing ? "Salvar alterações" : "Criar produto"}
                </button>
                <button onClick={() => setModalOpen(false)} style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.2)", background: "transparent", color: "var(--gray-light)", fontSize: 14, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
