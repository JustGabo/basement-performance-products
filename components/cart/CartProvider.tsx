"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { CartLine, StoreProduct } from "@/lib/commerce";
import { localCartStorage } from "@/lib/commerce/browser-cart";

export type CartItem = CartLine;

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (product: StoreProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      setItems(localCartStorage.read());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (hydrated) localCartStorage.write(items);
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    hydrated,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    subtotalCents: items.reduce((total, item) => total + item.product.priceCents * item.quantity, 0),
    addItem(product, quantity = 1) {
      const amount = Math.max(1, quantity);
      const locale = window.localStorage.getItem("basement-locale");
      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id);
        if (!existing) return [...current, { product, quantity: amount }];
        return current.map((item) => item.product.id === product.id
          ? { ...item, quantity: item.quantity + amount }
          : item);
      });
      toast.success(locale === "es" ? `${product.name} agregado al carrito` : `${product.name} added to cart`, {
        description: locale === "es"
          ? `${amount} ${amount === 1 ? "artículo agregado" : "artículos agregados"} a tu garaje.`
          : `${amount} ${amount === 1 ? "item" : "items"} added to your garage.`,
        duration: 6000,
        action: {
          label: locale === "es" ? "Deshacer" : "Undo",
          onClick: () => setItems((current) => current.flatMap((item) => {
            if (item.product.id !== product.id) return [item];
            const nextQuantity = item.quantity - amount;
            return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
          })),
        },
      });
    },
    updateQuantity(productId, quantity) {
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => item.product.id !== productId));
        return;
      }
      setItems((current) => current.map((item) => item.product.id === productId ? { ...item, quantity } : item));
    },
    removeItem(productId) {
      setItems((current) => current.filter((item) => item.product.id !== productId));
    },
    clearCart() {
      setItems([]);
    },
  }), [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider.");
  return context;
}
