import Fuse from "fuse.js";
import { Product } from "@/lib/products-mock";
import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase/fetch-all";

export type SearchSuggestion = {
  type: "produto" | "categoria" | "subcategoria";
  label: string;
  sublabel?: string;
  href: string;
  product?: Product;
};

/* ── catálogo real do Supabase, com cache em memória ────────────
   A busca antes indexava os produtos MOCK — nenhum produto real
   aparecia. Agora carrega o catálogo inteiro (em lotes de 1.000,
   por causa do teto do PostgREST) uma vez e guarda por 5 min.
   O índice Fuse também é construído uma vez por carga, não a
   cada tecla digitada.
─────────────────────────────────────────────────────────────── */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

type SearchIndex = {
  products: Product[];
  prodFuse: Fuse<Product>;
  catFuse:  Fuse<{ name: string; slug: string }>;
  subFuse:  Fuse<{ name: string; slug: string }>;
};

let cachedIndex: SearchIndex | null = null;
let cachedAt = 0;
let loadPromise: Promise<SearchIndex> | null = null;

function slugify(name: string) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function toProduct(p: Record<string, unknown>): Product {
  const imgs = [...((p.product_images as { url: string; sort_order: number }[]) ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order).map(i => i.url);
  const cat = p.categories as { name: string; slug: string } | null;
  return {
    id: String(p.id), name: String(p.name), slug: String(p.slug),
    price: Number(p.price), originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: cat?.name ?? "", subcategory: String(p.subcategory ?? ""),
    material: String(p.material ?? ""), description: String(p.description ?? ""),
    details: (p.details as string[]) ?? [], images: imgs, stock: Number(p.stock),
    sizes: (p.sizes as string[]) ?? undefined, sides: (p.sides as string[]) ?? undefined,
    featured: Boolean(p.featured), isNew: Boolean(p.is_new),
    onSale: Boolean(p.on_sale), active: Boolean(p.active),
    createdAt: String(p.created_at),
  } as Product;
}

/* ── índice Fuse para produtos ──────────────────────────────────
   keys: campos onde a busca vai procurar, com pesos diferentes
   threshold: 0 = exato, 1 = aceita qualquer coisa
              0.4 é um bom balanço — aceita ~2 erros em palavras curtas
   distance: quanto mais alto, mais longe no texto ele procura
   minMatchCharLength: ignora matches de 1-2 letras (evita falsos positivos)
─────────────────────────────────────────────────────────────── */
function buildProductIndex(products: Product[]) {
  return new Fuse(products, {
    keys: [
      { name: "name",        weight: 3 },  // nome tem peso maior
      { name: "subcategory", weight: 2 },
      { name: "category",    weight: 2 },
      { name: "material",    weight: 1 },
      { name: "description", weight: 0.5 },
    ],
    threshold:          0.4,   // 0 = exato, 1 = qualquer coisa
    distance:           100,
    minMatchCharLength: 3,
    includeScore:       true,
    ignoreLocation:     true,  // busca em qualquer posição do texto
    useExtendedSearch:  false,
  });
}

/* ── índice para categorias / subcategorias ─────────────────── */
function buildCategoryIndex(items: { name: string; slug: string }[]) {
  return new Fuse(items, {
    keys: [{ name: "name", weight: 1 }],
    threshold:          0.35,
    minMatchCharLength: 3,
    includeScore:       true,
    ignoreLocation:     true,
  });
}

async function loadIndex(): Promise<SearchIndex> {
  // cache ainda válido
  if (cachedIndex && Date.now() - cachedAt < CACHE_TTL) return cachedIndex;
  // já tem uma carga em andamento — reaproveita (evita corridas)
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const sb = createClient();
    const rows = await fetchAllRows((from, to) =>
      sb
        .from("products")
        .select("*, categories(name,slug), product_images(url,sort_order)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .range(from, to)
    );

    const products = rows.map(p => toProduct(p as Record<string, unknown>));

    const allCats = [...new Map(
      products.filter(p => p.category)
        .map(p => [p.category, { name: p.category, slug: slugify(p.category) }])
    ).values()];

    const allSubs = [...new Map(
      products.map(p => [p.subcategory, { name: p.subcategory, slug: p.subcategory }])
    ).values()].filter(s => s.name);

    const index: SearchIndex = {
      products,
      prodFuse: buildProductIndex(products),
      catFuse:  buildCategoryIndex(allCats),
      subFuse:  buildCategoryIndex(allSubs),
    };

    cachedIndex = index;
    cachedAt = Date.now();
    return index;
  })();

  try {
    return await loadPromise;
  } finally {
    loadPromise = null;
  }
}

/* aquece o cache (ex.: quando o usuário foca a barra de busca) */
export function preloadSearchIndex() {
  loadIndex().catch(e => console.error("preloadSearchIndex:", e));
}

/* ── busca completa (para a página /busca) ───────────────────── */
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim() || query.length < 2) return [];
  try {
    const { prodFuse } = await loadIndex();
    return prodFuse.search(query)
      // ordena por score (menor = mais relevante no Fuse)
      .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
      .map(r => r.item);
  } catch (e) {
    console.error("searchProducts:", e);
    return [];
  }
}

/* ── sugestões do dropdown ───────────────────────────────────── */
export async function getSuggestions(query: string, includePrices = true): Promise<SearchSuggestion[]> {
  if (!query.trim() || query.length < 2) return [];

  let index: SearchIndex;
  try {
    index = await loadIndex();
  } catch (e) {
    console.error("getSuggestions:", e);
    return [];
  }

  const results: SearchSuggestion[] = [];

  /* categorias */
  index.catFuse.search(query).slice(0, 2).forEach(({ item }) => {
    results.push({
      type:     "categoria",
      label:    item.name,
      sublabel: "Categoria",
      href:     `/categorias/${item.slug}`,
    });
  });

  /* subcategorias */
  index.subFuse.search(query).slice(0, 2).forEach(({ item }) => {
    results.push({
      type:     "subcategoria",
      label:    item.name,
      sublabel: "Subcategoria",
      href:     `/busca?q=${encodeURIComponent(item.name)}`,
    });
  });

  /* produtos individuais */
  index.prodFuse.search(query).slice(0, 5).forEach(({ item }) => {
    results.push({
      type:     "produto",
      label:    item.name,
      sublabel: includePrices ? `R$ ${item.price.toFixed(2).replace(".", ",")}` : undefined,
      href:     `/produtos/${item.slug}`,
      product:  item,
    });
  });

  return results.slice(0, 8);
}
