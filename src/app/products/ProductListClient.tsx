// app/products/[type]/ProductListClient.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { PublicProduct } from "@/types/product/products.types";

type Props = {
  products: PublicProduct[];
  total: number;
  page: number;
  limit: number;
  q?: string;
  category?: string;
  sort?: "new" | "price_asc" | "price_desc";
};

const SORT_LABELS: Record<NonNullable<Props["sort"]>, string> = {
  new: "ใหม่ล่าสุด",
  price_asc: "ราคาต่ำไปสูง",
  price_desc: "ราคาสูงไปต่ำ",
};

export default function ProductListClient({
  products,
  total,
  page,
  limit,
  q,
  category,
  sort = "new",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // ควบคุมช่องค้นหาแบบ “ซิงค์กับ URL”
  const [search, setSearch] = useState<string>(q ?? "");

  const updateQuery = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      const sp = new URLSearchParams(params?.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === "" || v === null) sp.delete(k);
        else sp.set(k, String(v));
      });
      // เปลี่ยน filter แล้วรีเซ็ต page = 1
      if ("q" in patch || "category" in patch || "sort" in patch) {
        sp.set("page", "1");
      }
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router]
  );

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ q: search });
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / Math.max(1, limit))),
    [total, limit]
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Sidebar ฟิลเตอร์ (ถ้าต้องมี) */}
      <aside className="md:w-1/6 space-y-4">
        {/* ค้นหา */}
        <form onSubmit={onSubmitSearch}>
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 w-full p-2 rounded border border-gray-700 bg-gray-900 text-white"
          />
          <button
            type="submit"
            className="w-full px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            ค้นหา
          </button>
        </form>

        {/* ตัวอย่างปุ่ม category (ถ้าจะมีหมวดหมู่คงที่/มาจาก BE ก็แทนที่ได้) */}
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Category</div>
          <div className="flex flex-wrap gap-2">
            {["", "Accessories", "Apparel", "Electronics"].map((c) => (
              <button
                key={c || "all"}
                type="button"
                onClick={() => updateQuery({ category: c || undefined })}
                className={`px-3 py-1 rounded border ${
                  (category ?? "") === c
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {c || "All"}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1">
        {/* แถบ sort + ผลรวม */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">
            พบ {total.toLocaleString()} รายการ
          </div>
          <div>
            <label className="mr-2 text-sm text-gray-300">เรียงโดย</label>
            <select
              value={sort}
              onChange={(e) =>
                updateQuery({
                  sort: e.target.value as Props["sort"],
                })
              }
              className="p-2 rounded border border-gray-700 bg-gray-900 text-white"
            >
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* รายการสินค้า */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            // ถ้า ProductCard ปัจจุบันรับ prop แบบเก่า ให้ทำ wrapper/adapter
            return (
              <ProductCard
                key={p._id}
                product={{
                  _id: p._id,
                  name: p.name,
                  image: p.image,
                  description: p.description,
                  priceFrom: p.priceFrom,
                  priceTo: p.priceTo,
                  // (ออปชัน) แสดงจำนวนตัวเลือก
                  skuCount: p.skuCount,
                  cover: p.cover,
                  store: p.store,
                }}
              />
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="px-3 py-1 rounded border border-gray-700 text-gray-200 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => updateQuery({ page: page - 1 })}
            >
              ← ก่อนหน้า
            </button>
            <span className="px-2 text-gray-400">
              หน้า {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border border-gray-700 text-gray-200 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => updateQuery({ page: page + 1 })}
            >
              ถัดไป →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
