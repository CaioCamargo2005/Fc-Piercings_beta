import { createClient } from "@/lib/supabase/client";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import type { Database } from "@/lib/supabase/database.types";

export type ProductRow    = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type ImageRow      = Database["public"]["Tables"]["product_images"]["Row"];
export type CategoryRow   = Database["public"]["Tables"]["categories"]["Row"];

/* ── produtos ──────────────────────────────────────────────── */

export async function fetchProducts(filters?: {
  categorySlug?: string;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  limit?: number;
}) {
  const supabase = createClient();

  let query = supabase
    .from("products")
    .select(`
      *,
      categories ( name, slug ),
      product_images ( url, sort_order )
    `)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (filters?.featured) query = query.eq("featured", true);
  if (filters?.isNew)    query = query.eq("is_new",   true);
  if (filters?.onSale)   query = query.eq("on_sale",  true);
  if (filters?.limit)    query = query.limit(filters.limit);

  if (filters?.categorySlug) {
    // precisa do id da categoria pelo slug
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .single();

    if (cat && 'id' in cat) query = query.eq("category_id", (cat as { id: string }).id);
  }

  // com limit explícito, uma query só resolve; sem limit, busca em
  // lotes de 1.000 para não truncar no teto padrão do PostgREST
  if (filters?.limit) {
    const { data, error } = await query;
    if (error) { console.error("fetchProducts:", error); return []; }
    return data ?? [];
  }

  try {
    const data = await fetchAllRows((from, to) => query.range(from, to));
    return data ?? [];
  } catch (error) {
    console.error("fetchProducts:", error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories ( name, slug ),
      product_images ( url, sort_order )
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error) { console.error("fetchProductBySlug:", error); return null; }
  return data;
}

export async function fetchAllProductsAdmin() {
  // sem filtro active=true — admin vê tudo
  // busca em lotes de 1.000 (teto padrão do PostgREST)
  const supabase = createClient();
  try {
    const data = await fetchAllRows((from, to) =>
      supabase
        .from("products")
        .select(`*, categories ( name, slug ), product_images ( url, sort_order )`)
        .order("created_at", { ascending: false })
        .range(from, to)
    );
    return data ?? [];
  } catch (error) {
    console.error("fetchAllProductsAdmin:", error);
    return [];
  }
}

/* ── criar / editar / excluir produto (admin) ──────────────── */

export async function createProduct(product: ProductInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(product as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: string, updates: ProductUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/* ── imagens ────────────────────────────────────────────────── */

export async function uploadProductImage(
  productId: string,
  file: File,
  sortOrder: number
): Promise<string> {
  const supabase = createClient();
  const ext  = file.name.split(".").pop();
  const path = `${productId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(path);

  const { error: insertError } = await supabase
    .from("product_images")
    .insert({ product_id: productId, url: publicUrl, sort_order: sortOrder } as never);

  if (insertError) throw new Error(insertError.message);
  return publicUrl;
}

export async function deleteProductImage(imageId: string, url: string) {
  const supabase = createClient();

  // extrair path do URL público
  const path = url.split("/product-images/")[1];
  if (path) {
    await supabase.storage.from("product-images").remove([path]);
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) throw new Error(error.message);
}

/* ── categorias ─────────────────────────────────────────────── */

export async function fetchCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  if (error) { console.error("fetchCategories:", error); return []; }
  return data ?? [];
}
