"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export type Address  = Database["public"]["Tables"]["addresses"]["Row"];
export type MockUser = Database["public"]["Tables"]["profiles"]["Row"] & {
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
  user:      MockUser | null;
  loggedIn:  boolean;
  loading:   boolean;
  login:     (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout:    () => void;
  updateUser:(data: Partial<MockUser>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  // só inicializa se as variáveis existirem
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = hasSupabase ? createClient() : null;

  /* ── carrega sessão ao iniciar ── */
  useEffect(() => {
    async function loadSession() {
      if (!supabase) { setLoading(false); return; }
    const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchAndSetProfile(session.user.id);
      }
      setLoading(false);
    }
    loadSession();

    /* escuta mudanças de auth (login, logout, refresh de token) */
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchAndSetProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAndSetProfile(userId: string) {
    if (!supabase) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: addresses } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false });

    if (profile && typeof profile === 'object') {
      setUser({
        ...(profile as object),
        addresses: addresses ?? [],
        orders:    [],
        wishlist:  [],
      } as unknown as MockUser);
    }
  }

  async function login(email: string, password: string) {
    if (!supabase) return { ok: false, error: 'Supabase não configurado' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
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
