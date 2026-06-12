import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type Profile       = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type Address       = Database["public"]["Tables"]["addresses"]["Row"];
export type AddressInsert = Database["public"]["Tables"]["addresses"]["Insert"];

/* ── autenticação ───────────────────────────────────────────── */

export async function signUp(
  email: string,
  password: string,
  name: string
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },  // passado ao trigger que cria o profile
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/conta/alterar-senha`,
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

/* ── perfil ─────────────────────────────────────────────────── */

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) { console.error("fetchProfile:", error); return null; }
  return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/* ── endereços ──────────────────────────────────────────────── */

export async function fetchAddresses(userId: string): Promise<Address[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false });

  if (error) { console.error("fetchAddresses:", error); return []; }
  return data ?? [];
}

export async function createAddress(address: AddressInsert) {
  const supabase = createClient();

  // se for primário, remove o primário anterior primeiro
  if (address.is_primary) {
    await supabase
      .from("addresses")
      .update({ is_primary: false } as never)
      .eq("user_id", address.user_id)
      .eq("is_primary", true);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert(address as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAddress(
  id: string,
  userId: string,
  updates: Partial<AddressInsert>
) {
  const supabase = createClient();

  if (updates.is_primary) {
    await supabase
      .from("addresses")
      .update({ is_primary: false } as never)
      .eq("user_id", userId)
      .eq("is_primary", true);
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(updates as never)
    .eq("id", id)
    .eq("user_id", userId)   // garante que o usuário só edita o próprio
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAddress(id: string, userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

/* ── verificar role (usado no middleware) ───────────────────── */

export async function getUserRole(userId: string): Promise<"customer" | "admin" | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return ((data as { role?: string } | null)?.role as "customer" | "admin") ?? null;
}
