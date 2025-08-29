"use client";

import { CartItem, AddToCartArgs } from "@/types/cart/cart";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (args: AddToCartArgs) => Promise<void>;
  updateQty: (
    productId: string,
    itemId: string,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (productId: string, itemId: string) => Promise<void>;
  /** ล้างทั้งฝั่ง FE ทันที + (ค่าเริ่มต้น) พยายามล้างฝั่ง BE + sync กลับ */
  clearCart: (opts?: { localOnly?: boolean }) => Promise<void>;
  /** โหลดจาก BE อีกรอบ (ใช้หลังจ่ายเสร็จ/กลับมาโฟกัสฯลฯ) */
  refetchCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error?: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const LS_KEY = "cart:lastSnapshot";
const BC_NAME = "cart"; // broadcast channel name

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // ---------------- helpers ----------------
  const api = useCallback(async (input: string, init?: RequestInit) => {
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
      try {
        const j = await res.json();
        msg = j?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    return res.json();
  }, []);

  const writeSnapshot = (items: CartItem[]) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch {}
  };

  const clearLocalCart = useCallback(() => {
    setCartItems([]);
    writeSnapshot([]);
  }, []);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // หมายเหตุ: ถ้า /cart ของคุณคืน {items: CartItem[]} ให้ปรับเป็น data.items
      const data: CartItem[] = await api("/cart");
      setCartItems(data);
      writeSnapshot(data);
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
  }, []);

  const refetchCart = useCallback(async () => {
    await loadCart();
  }, [loadCart]);

  useEffect(() => {
    // โชว์ snapshot ทันทีถ้ามี (UX ดีขึ้น)
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setCartItems(JSON.parse(raw));
    } catch {}
    // แล้วค่อย sync จริงกับ BE
    loadCart();
  }, [loadCart]);

  // cross-tab broadcast: รับสัญญาณล้าง cart
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(BC_NAME);
      bc.onmessage = (e) => {
        if (e.data?.type === "cart:cleared") {
          clearLocalCart();
        }
      };
    } catch {}
    return () => bc?.close();
  }, []);

  // ---------------- actions ----------------
  const addToCart = useCallback(
    async ({ product, sku, quantity = 1 }: AddToCartArgs) => {
      await api(`/cart/items`, {
        method: "POST",
        body: JSON.stringify({
          productId: product._id,
          skuId: sku._id,
          qty: quantity,
        }),
      });
      await loadCart();
    },
    [api, loadCart]
  );

  const updateQty = useCallback(
    async (_productId: string, itemId: string, quantity: number) => {
      await api(`/cart/items/by-sku/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ qty: quantity }),
      });
      await loadCart();
    },
    [api, loadCart]
  );

  const removeFromCart = useCallback(
    async (_productId: string, itemId: string) => {
      await api(`/cart/items/${itemId}`, { method: "DELETE" });
      await loadCart();
    },
    [api, loadCart]
  );

  const clearCart = useCallback(
    async (opts?: { localOnly?: boolean }) => {
      // 1) broadcast ให้ทุกแท็บเคลียร์
      try {
        const bc = new BroadcastChannel(BC_NAME);
        bc.postMessage({ type: "cart:cleared" });
        bc.close();
      } catch {}

      if (opts?.localOnly) return;

      // 2) ล้างฝั่ง BE (best-effort)
      try {
        await api(`/cart/clear`, { method: "POST" });
      } catch {}
      // 3) sync ปิดท้าย
      await loadCart();
    },
    [api, loadCart]
  );

  const totalItems = useMemo(
    () => cartItems.reduce((s, it) => s + it.quantity, 0),
    [cartItems]
  );
  const totalAmount = useMemo(
    () => cartItems.reduce((s, it) => s + it.subtotal, 0),
    [cartItems]
  );

  const value = useMemo<CartContextType>(
    () => ({
      cartItems,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      refetchCart, // ← อันนี้ก็เป็น useCallback แล้ว
      totalItems,
      totalAmount,
      loading,
      error,
    }),
    [
      cartItems,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      refetchCart,
      totalItems,
      totalAmount,
      loading,
      error,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
