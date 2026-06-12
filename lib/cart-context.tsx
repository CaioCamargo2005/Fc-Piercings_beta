"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "./products-mock";

export type CartItem = {
  product: Product;
  qty: number;
  selectedSize?: string;
};

type CartContextType = {
  items: CartItem[];
  count: number;                          // total de unidades no carrinho
  subtotal: number;                       // valor sem frete
  addItem: (product: Product, qty: number, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQty: (productId: string, qty: number, size?: string) => void;
  clearCart: () => void;
  isInCart: (productId: string, size?: string) => boolean;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* chave única por produto + tamanho */
  function key(productId: string, size?: string) {
    return size ? `${productId}__${size}` : productId;
  }

  function addItem(product: Product, qty: number, size?: string) {
    setItems(prev => {
      const k = key(product.id, size);
      const existing = prev.find(i => key(i.product.id, i.selectedSize) === k);
      if (existing) {
        return prev.map(i =>
          key(i.product.id, i.selectedSize) === k
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i
        );
      }
      return [...prev, { product, qty, selectedSize: size }];
    });
  }

  function removeItem(productId: string, size?: string) {
    const k = key(productId, size);
    setItems(prev => prev.filter(i => key(i.product.id, i.selectedSize) !== k));
  }

  function updateQty(productId: string, qty: number, size?: string) {
    const k = key(productId, size);
    if (qty <= 0) { removeItem(productId, size); return; }
    setItems(prev =>
      prev.map(i =>
        key(i.product.id, i.selectedSize) === k
          ? { ...i, qty: Math.min(qty, i.product.stock) }
          : i
      )
    );
  }

  function clearCart() { setItems([]); }

  function isInCart(productId: string, size?: string) {
    return items.some(i => key(i.product.id, i.selectedSize) === key(productId, size));
  }

  const count    = items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, removeItem, updateQty, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
