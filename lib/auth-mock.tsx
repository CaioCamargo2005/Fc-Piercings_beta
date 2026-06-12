"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Address = {
  id: string;
  label: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  principal: boolean;
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

export type MockUser = {
  name: string;
  email: string;
  phone: string;
  accountType: "pessoa_fisica" | "pessoa_juridica";
  cpf: string;
  cnpj: string;
  addresses: Address[];
  orders: Order[];
  wishlist: WishlistItem[];
  role: "admin" | "customer";
};

/* ── Usuário falso para testes ── */
const MOCK_USER_DATA: MockUser = {
  name: "Fernanda Cotrim",
  email: "fernanda@email.com",
  phone: "(19) 99710-3023",
  accountType: "pessoa_fisica",
  cpf: "123.456.789-00",
  cnpj: "",
  addresses: [
    {
      id: "1",
      label: "Casa",
      cep: "13481-341",
      rua: "Rua Professor Arlindo Silvestre",
      numero: "287",
      bairro: "Conjunto Habitacional Victor D'Andrea",
      cidade: "Limeira",
      uf: "SP",
      principal: true,
    },
  ],
  orders: [
    {
      id: "PED-2024-001",
      date: "2024-05-10",
      status: "entregue",
      total: 179.9,
      items: [
        { name: "Argola Titânio Natural", qty: 2, price: 69.9 },
        { name: "Labret CZ Gold PVD", qty: 1, price: 40.1 },
      ],
    },
    {
      id: "PED-2024-002",
      date: "2024-05-28",
      status: "enviado",
      total: 129.9,
      items: [
        { name: "Septo Titânio Cravejado", qty: 1, price: 129.9 },
      ],
    },
    {
      id: "PED-2024-003",
      date: "2024-06-01",
      status: "processando",
      total: 89.9,
      items: [
        { name: "Nostril Aço PVD Gold", qty: 3, price: 29.97 },
      ],
    },
  ],
  wishlist: [], // populado quando a página de produto existir
  role: "admin",  // trocar para "customer" para testar sem acesso admin
};

/* ── Contexto ── */
type AuthContextType = {
  user: MockUser | null;
  loggedIn: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<MockUser>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Começa logado para facilitar os testes — mude para `null` para testar o fluxo de login
  const [user, setUser] = useState<MockUser | null>(MOCK_USER_DATA);

  async function login(email: string, _password: string) {
    // Simula delay de rede
    await new Promise((r) => setTimeout(r, 800));
    // Aceita qualquer email/senha para testes
    if (!email.includes("@")) return { ok: false, error: "E-mail inválido" };
    setUser({ ...MOCK_USER_DATA, email });
    return { ok: true };
  }

  function logout() {
    setUser(null);
  }

  function updateUser(data: Partial<MockUser>) {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, loggedIn: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
