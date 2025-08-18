"use client";

import { CartItem, AddToCartArgs } from "@/types/cart/cart";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (args: AddToCartArgs) => Promise<void>;
  updateQty: (productId: string, itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error?: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const LS_KEY = "cart:lastSnapshot";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string>();

  // -- helpers ---------------------------------------------------------
  const api = async (input: string, init?: RequestInit) => {
    const url = input.startsWith("http")
      ? input
      : `${process.env.NEXT_PUBLIC_API_URL}${input}`;
    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      ...init,
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = j?.message || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  };

  // map response → CartItem[] (เผื่อโครงสร้างฝั่ง BE ไม่ตรง 100%)
  // const mapServerCart = (server: CartItem): CartItem[] => {
  //   console.log(server,"server");
    
  //   // const items: CartItem = Array.isArray(server) ? server : [];

  //   return server.map((it) => ({
  //     productId: String(it.productId),
  //     productName: it.productName,
  //     productImage: it.productImage,
  //     store: it.store, // { storeId, name, slug }
  //     sku: {
  //       skuId: String(it.sku.skuId),
  //       attributes: it.sku.attributes ?? {},
  //       price: it.sku?.price ?? 0,
  //       image: it.sku?.image,
  //       purchasable: it.sku?.purchasable ?? true,
  //       available: it.sku?.available,
  //     },
  //     quantity: it.quantity ?? 1,
  //     subtotal: it.subtotal ?? (it.quantity ?? 1) * (it.sku?.price ?? 0),
  //   }));
  // };

  const loadCart = async () => {
    setLoading(true);
    setError(undefined);
    try {
      // แนะนำให้เรียก /cart เสมอ (รองรับทั้ง guest/user ตามที่คุณทำ Optional JWT)
      const data: CartItem[] = await api("/cart");
      console.log(data,'data');
      
      // const items = mapServerCart(data);
      // console.log(data,'data');
      
      setCartItems(data);
      // cache ไว้ใน LS เพื่อ UX
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (e) {
      setError("Failed to load cart");
      // fallback: ใช้ snapshot เก่าใน LS
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) setCartItems(JSON.parse(raw));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // โชว์ snapshot ทันทีถ้ามี (ไม่บังคับ)
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setCartItems(JSON.parse(raw));
    } catch {}
    // แล้วค่อย sync จริงกับ BE
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- actions ---------------------------------------------------------
  const addToCart = async ({ product, sku, quantity = 1 }: AddToCartArgs) => {
    // โยนให้ BE เช็คสต็อก/สงวนสินค้า/ราคา snapshot
    await api(`/cart/items`, {
      method: "POST",
      body: JSON.stringify({ productId: product._id, skuId: sku._id, qty: quantity }),
    });
    await loadCart();
  };

  const updateQty = async (_productId: string, itemId: string, quantity: number) => {
    await api(`/cart/items/by-sku/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ qty: quantity }),
    });
    await loadCart();
  };

  const removeFromCart = async (_productId: string, itemId: string) => {
    await api(`/cart/items/${itemId}`, { method: "DELETE" });
    await loadCart();
  };

  const clearCart = async () => {
    await api(`/cart/clear`, { method: "POST" });
    await loadCart();
  };

  const totalItems  = useMemo(() => cartItems.reduce((s, it) => s + it.quantity, 0), [cartItems]);
  const totalAmount = useMemo(() => cartItems.reduce((s, it) => s + it.subtotal, 0), [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
