"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

export type Address    = Database["public"]["Tables"]["addresses"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type MockUser = ProfileRow & {
  addresses: Address[];
  orders:    Order[];
  wishlist:  WishlistItem[];
};

export type Order = {
  id: string;
  date: string;
  status: "processando" | "enviado" | "entregue" | "cancelado";
  total: number;
  items: { name: string; qty: number; price: number }[];
};

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type AuthContextType = {
  user:       MockUser | null;
  loggedIn:   boolean;
  loading:    boolean;
  login:      (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout:     () => void;
  updateUser: (data: Partial<MockUser>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

/* ── cria cliente UMA vez fora do componente ── */
function makeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient<Database>(url, key);
}

// singleton — não recria a cada render
let _client: ReturnType<typeof makeClient> = undefined as unknown as ReturnType<typeof makeClient>;
function getClient() {
  if (_client === undefined) _client = makeClient();
  return _client;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const sb = getClient();
    if (!sb) return;

    const { data: profile, error } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();   // maybeSingle não falha se retornar 0 rows

    if (error) {
      console.error("fetchProfile error:", error.message);
      return;
    }
    if (!profile) {
      console.warn("Profile não encontrado para userId:", userId);
      return;
    }

    const { data: addresses } = await sb
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false });

    setUser({
      ...(profile as ProfileRow),
      addresses: addresses ?? [],
      orders:    [],
      wishlist:  [],
    });
  }

  useEffect(() => {
    const sb = getClient();
    if (!sb) {
      setLoading(false);
      return;
    }

    // Verifica sessão existente
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchProfile(user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Escuta eventos de auth
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // token renovado — garante que o user ainda está setado
        if (!user) fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const sb = getClient();
    if (!sb) return { ok: false, error: "Supabase não configurado. Verifique o .env.local." };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async function logout() {
    const sb = getClient();
    if (!sb) return;
    await sb.auth.signOut();
  }

  function updateUser(data: Partial<MockUser>) {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }

  return (
    <AuthContext.Provider value={{ user, loggedIn: !!user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
