"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { ProductListItem, SkuRow } from "@/types/product/products.types";
import {
  attrsToText,
  fmtPrice,
  priceSummaryFor,
} from "@/lib/helpers/productList";
import AdjustStockModal from "@/components/inventory/AdjustStockModal";
import ThumbnailWithModal from "@/components/store/products/ThumbnailWithModal";

type DeleteTarget =
  | { type: "product"; productId: string }
  | { type: "sku"; productId: string; skuId: string };

export default function ProductList(): React.ReactElement {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // inventory
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [target, setTarget] = useState<{
    productId: string;
    sku: SkuRow;
  } | null>(null);

  const openAdjust = (productId: string, sku: SkuRow) => {
    setTarget({ productId, sku });
    setAdjustOpen(true);
  };

  async function adjustStock(delta: number, reason: string) {
    if (!target) return;
    const { productId, sku } = target;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/inventory/products/${productId}/skus/${sku._id}/adjust`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delta, reason }),
        }
      );
      if (!res.ok) throw new Error(await res.text());

      const result: { onHand: number; reserved: number; available: number } =
        await res.json();

      // อัปเดต cache ทันที
      setSkuCache((prev) => {
        const list = prev[productId] ?? [];
        const next = list.map((s) =>
          s._id === sku._id ? { ...s, ...result } : s
        );
        return { ...prev, [productId]: next };
      });

      toast.success("Stock adjusted");
    } catch (e) {
      toast.error("Adjust failed");
    } finally {
      setAdjustOpen(false);
      setTarget(null);
    }
  }

  // กาง/พับ
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const toggleRow = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // แคช SKUs ต่อ productId
  const [skuCache, setSkuCache] = useState<Record<string, SkuRow[]>>({});

  // ลบ
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);

  // โหลด products ของร้าน (อิง JWT)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data: ProductListItem[] = await res.json();
        console.log(data, "data");

        if (cancelled) return;
        setProducts(data);

        // 🔥 พรีเฟ็ตช์ SKUs หลังจากตั้ง products แล้ว
        // ใช้ skuCache ปัจจุบันเป็นพื้นฐานเพื่อกันโหลดซ้ำ
        await prefetchSkusForList(data, skuCache);
      } catch {
        // setProducts([]);
        if (!cancelled) setProducts([]);
      } finally {
        // setLoading(false);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // โหลด SKUs เมื่อกางครั้งแรก
  const prefetchSkusForList = async (
    items: ProductListItem[],
    currentCache: Record<string, SkuRow[]>
  ) => {
    const ids = items.map((p) => p._id).filter((id) => !currentCache[id]); // ข้ามตัวที่เคยโหลดแล้ว

    if (!ids.length) return;

    // (ถ้าลิสต์ยาวมาก แนะนำจำกัด concurrency; ตัวอย่างนี้ยิงพร้อมกันทั้งหมด)
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}/skus`, {
          credentials: "include",
        })
          .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
          .then((skus: SkuRow[]) => ({ id, skus }))
      )
    );

    console.log(results, "results");

    // รวมผลที่สำเร็จ แล้วอัปเดต cache ครั้งเดียว
    setSkuCache((prev) => {
      const next = { ...prev };
      for (const r of results) {
        if (r.status === "fulfilled") {
          next[r.value.id] = r.value.skus;
        }
      }
      return next;
    });
  };

  const handleRowClick = async (p: ProductListItem) => {
    toggleRow(p._id);
  };

  const deleteNow = async () => {
    if (!deleting) return;
    try {
      if (deleting.type === "product") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${deleting.productId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(await res.text());
        setProducts((prev) => prev.filter((p) => p._id !== deleting.productId));
        // ลบแคช SKUs ด้วย
        setSkuCache((prev) => {
          const { [deleting.productId]: _, ...rest } = prev;
          return rest;
        });
        toast.success("ลบสินค้าแล้ว");
      } else {
        const { productId, skuId } = deleting;
        // เลือกหนึ่งรูปแบบตาม BE ของคุณ:
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/skus/${skuId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(await res.text());
        setSkuCache((prev) => ({
          ...prev,
          [productId]: (prev[productId] ?? []).filter((s) => s._id !== skuId),
        }));
        toast.success("ลบ SKU แล้ว");
      }
    } catch {
      toast.error("ลบไม่สำเร็จ");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full max-w-none px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Product List</h1>
        <Link
          href="/store/products/create"
          className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          +Add Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl shadow select-none">
        <table className="min-w-full text-left bg-gray-800 rounded-xl border border-gray-700">
          <thead className="bg-gray-600 text-white">
            <tr className="text-center">
              <th className="px-4 py-3 border border-gray-700 w-[16%]">Name</th>
              <th className="px-4 py-3 border border-gray-700 w-[12%]">
                Category
              </th>
              <th className="px-4 py-3 border border-gray-700 w-[10%]">Type</th>
              <th className="px-4 py-3 border border-gray-700 w-[14%]">
                Image
              </th>
              <th className="px-4 py-3 border border-gray-700 w-[18%]">
                Price
              </th>
              <th className="px-4 py-3 border border-gray-700 w-[10%]">
                #SKUs
              </th>
              <th className="px-4 py-3 border border-gray-700 w-[10%]">
                Status
              </th>
              <th className="px-4 py-3 border border-gray-700 w-[10%]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              const opened = openIds.has(p._id);
              const skus = skuCache[p._id];

              // คำนวณช่วงราคา (min–max) จาก SKUs (ตกลงค่า defaultPrice ให้กับ SKU ที่ไม่ระบุราคา)
              const priceSummary = priceSummaryFor(skus, p.defaultPrice);

              return (
                <React.Fragment key={p._id}>
                  <tr
                    className={`border-gray-700 hover:bg-gray-950 ${
                      skus ? "cursor-pointer" : ""
                    } ${opened ? "bg-gray-900" : ""}`}
                    onClick={() => handleRowClick(p)}
                  >
                    <td className="px-4 py-3 border border-gray-700 text-left">
                      <div className="flex items-center">
                        <div className="w-6 flex justify-center items-center mr-2">
                          <span className="text-xs">{opened ? "▾" : "▸"}</span>
                        </div>
                        <div className="truncate">{p.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-700">
                      {p.category}
                    </td>
                    <td className="px-4 py-3 border border-gray-700">
                      {p.type}
                    </td>
                    <td
                      className="px-4 py-3 border border-gray-700 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ThumbnailWithModal name={p.name} images={p.images} />
                    </td>
                    <td className="px-4 py-3 border border-gray-700 text-right">
                      {priceSummary.text}
                    </td>
                    <td className="px-4 py-3 border border-gray-700 text-center">
                      {priceSummary.count || (skus ? 0 : "…")}
                    </td>
                    <td className="px-4 py-3 border border-gray-700 text-center">
                      {p.status}
                    </td>
                    <td
                      className="px-4 py-3 border border-gray-700 text-center space-y-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/store/products/${p._id}/edit`}
                        className="px-2 py-1 text-blue-500 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          setDeleting({ type: "product", productId: p._id })
                        }
                        className="px-2 py-1 text-red-500 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {/* SKUs section */}
                  {opened && (
                    <tr className="bg-gray-900/70">
                      <td colSpan={8} className="border-gray-800">
                        {skus ? (
                          skus.length ? (
                            <div className="p-4">
                              <table className="min-w-full text-sm border border-gray-700">
                                <thead className="bg-gray-700">
                                  <tr>
                                    <th className="px-3 py-2 border border-gray-700 text-left">
                                      Attributes
                                    </th>
                                    <th className="px-3 py-2 border border-gray-700 text-right">
                                      Price
                                    </th>
                                    <th className="px-3 py-2 border border-gray-700">
                                      SKU Code
                                    </th>
                                    <th className="px-3 py-2 border border-gray-700">
                                      Image
                                    </th>
                                    <th className="px-3 py-2 border border-gray-700">
                                      On-hand
                                    </th>
                                    <th className="px-3 py-2 border border-gray-700">
                                      Reserved
                                    </th>
                                    <th className="px-3 py-2 border border-gray-700">
                                      Available
                                    </th>
                                    <th className="px-3 py-2 border border-gray-700">
                                      Purchasable
                                    </th>
                                    <th className="px-3 py-2 border border-gray-700 w-20">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {skus.map((s) => {
                                    const available =
                                      s.available ??
                                      Math.max(
                                        0,
                                        (s.onHand ?? 0) - (s.reserved ?? 0)
                                      );
                                    const low = available <= 5;
                                    return (
                                      <tr key={s._id}>
                                        <td className="px-3 py-2 border border-gray-700">
                                          {attrsToText(s.attributes) || "—"}
                                        </td>
                                        <td className="px-3 py-2 border border-gray-700 text-right">
                                          {fmtPrice(
                                            typeof s.price === "number"
                                              ? s.price
                                              : p.defaultPrice
                                          )}
                                        </td>
                                        <td className="px-3 py-2 border border-gray-700">
                                          {s.skuCode ?? "—"}
                                        </td>
                                        <td className="px-3 py-2 border border-gray-700 truncate">
                                          {s.images?.[0] ? (
                                            <Image
                                              src={s.images?.[0].url ?? "/no-image.png"}
                                              alt={attrsToText(s.attributes)}
                                              width={80}
                                              height={80}
                                              className="h-20 w-20 mx-auto rounded object-cover transition-transform duration-200 ease-in-out hover:scale-110"
                                            />
                                          ) : (
                                            "—"
                                          )}
                                        </td>
                                        <td className="px-3 py-2 border border-gray-700 text-right">
                                          {fmtPrice(s.onHand) || "—"}
                                        </td>
                                        <td
                                          className={`px-3 py-2 border border-gray-700 text-right ${
                                            (s.reserved ?? 0) > 0
                                              ? "text-amber-700 font-semibold"
                                              : ""
                                          }`}
                                        >
                                          {fmtPrice(s.reserved) || "—"}
                                        </td>
                                        <td
                                          className={`px-3 py-2 border border-gray-700 text-right ${
                                            low
                                              ? "text-amber-400 font-semibold"
                                              : ""
                                          }`}
                                        >
                                          {fmtPrice(available) || "—"}
                                        </td>
                                        <td className="px-3 py-2 border border-gray-700 text-center">
                                          {s.purchasable ?? true ? "✓" : "—"}
                                        </td>
                                        <td className="px-3 py-2 border border-gray-700 text-center">
                                          <button
                                            type="button"
                                            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                                            onClick={() => openAdjust(p._id, s)}
                                          >
                                            Adjust
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="p-4 text-gray-400">No SKUs.</div>
                          )
                        ) : (
                          <div className="p-4 text-gray-400">Loading SKUs…</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {!products.length && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm modal (ง่ายๆ) */}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[420px]">
            <h3 className="text-lg font-semibold text-white mb-2">
              ยืนยันการลบ
            </h3>
            <p className="text-gray-300 mb-4">
              คุณต้องการลบรายการนี้ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border border-gray-600 text-gray-200 hover:bg-gray-800 cursor-pointer"
                onClick={() => setDeleting(null)}
              >
                ยกเลิก
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                onClick={deleteNow}
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      <AdjustStockModal
        value={target}
        open={adjustOpen}
        onClose={() => {
          setAdjustOpen(false);
          setTarget(null);
        }}
        onSubmit={adjustStock}
      />
    </div>
  );
}
