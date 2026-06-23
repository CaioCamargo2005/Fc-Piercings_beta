import Fuse from "fuse.js";
import { getAllProducts, Product } from "@/lib/products-mock";

export type SearchSuggestion = {
  type: "produto" | "categoria" | "subcategoria";
  label: string;
  sublabel?: string;
  href: string;
  product?: Product;
};

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

/* ── índice para categorias ──────────────────────────────────── */
function buildCategoryIndex(items: { name: string; slug: string }[]) {
  return new Fuse(items, {
    keys: [{ name: "name", weight: 1 }],
    threshold:          0.35,
    minMatchCharLength: 3,
    includeScore:       true,
    ignoreLocation:     true,
  });
}

/* ── busca completa (para a página /busca) ───────────────────── */
export function searchProducts(query: string): Product[] {
  if (!query.trim() || query.length < 2) return [];
  const products = getAllProducts();
  const fuse     = buildProductIndex(products);
  const results  = fuse.search(query);
  // ordena por score (menor = mais relevante no Fuse)
  return results
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    .map(r => r.item);
}

/* ── sugestões do dropdown ───────────────────────────────────── */
export function getSuggestions(query: string): SearchSuggestion[] {
  if (!query.trim() || query.length < 2) return [];

  const products = getAllProducts();
  const results:  SearchSuggestion[] = [];

  /* categorias */
  const allCats = [...new Map(
    products.map(p => [p.category, {
      name: p.category,
      slug: p.category.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-"),
    }])
  ).values()];

  const catFuse   = buildCategoryIndex(allCats);
  const catHits   = catFuse.search(query).slice(0, 2);
  catHits.forEach(({ item }) => {
    results.push({
      type:     "categoria",
      label:    item.name,
      sublabel: "Categoria",
      href:     `/categorias/${item.slug}`,
    });
  });

  /* subcategorias */
  const allSubs = [...new Map(
    products.map(p => [p.subcategory, { name: p.subcategory, slug: p.subcategory }])
  ).values()].filter(s => s.name);

  const subFuse = buildCategoryIndex(allSubs);
  const subHits = subFuse.search(query).slice(0, 2);
  subHits.forEach(({ item }) => {
    results.push({
      type:     "subcategoria",
      label:    item.name,
      sublabel: "Subcategoria",
      href:     `/busca?q=${encodeURIComponent(item.name)}`,
    });
  });

  /* produtos individuais */
  const prodFuse = buildProductIndex(products);
  const prodHits = prodFuse.search(query).slice(0, 5);
  prodHits.forEach(({ item }) => {
    results.push({
      type:     "produto",
      label:    item.name,
      sublabel: `R$ ${item.price.toFixed(2).replace(".", ",")}`,
      href:     `/produtos/${item.slug}`,
      product:  item,
    });
  });

  return results.slice(0, 8);
}
