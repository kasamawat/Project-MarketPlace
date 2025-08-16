// components/ProductPreviewModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import type { PublicProduct, SkuPublic } from "@/types/product/products.types";

type Props = {
  product: PublicProduct; // ควรมี: _id, name, image?, priceFrom?, priceTo?, skuCount
  onClose: () => void;
};

const mockStar = 4.5;
const fmt = (n?: number) =>
  typeof n === "number"
    ? n.toLocaleString("th-TH", { minimumFractionDigits: 0 })
    : "—";

export default function ProductPreviewModal({ product, onClose }: Props) {
  const { addToCart } = useCart();

  // ----- local states -----
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // โหลด SKUs (public)
  const [skus, setSkus] = useState<SkuPublic[]>([]);
  const [loadingSkus, setLoadingSkus] = useState(false);
  const [errorSkus, setErrorSkus] = useState<string | null>(null);

  // ตัวเลือกที่ผู้ใช้เลือก
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // เปิด animation + รีเซ็ตทุกครั้งที่เปิด modal/เปลี่ยน product
  useEffect(() => {
    setIsVisible(true);
    setCount(1);
    setIsWishlisted(false);
    setSelectedOptions({});
    setSkus([]);
    setErrorSkus(null);
    setLoadingSkus(true);

    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public/products/${product._id}/skus`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(await res.text());
        const data: SkuPublic[] = await res.json();
        setSkus((data || []).filter((s) => s.purchasable !== false));
      } catch (e) {
        setErrorSkus("โหลดตัวเลือกไม่สำเร็จ");
      } finally {
        setLoadingSkus(false);
      }
    })();
  }, [product._id]);

  // ปิด modal แบบนุ่มนวล
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  // ====== จาก SKUs -> fields/options ======
  // fields = ชื่อ attribute ทั้งหมด (Color/Size/…)
  const fields = useMemo(() => {
    const set = new Set<string>();
    for (const s of skus) {
      Object.keys(s.attributes || {}).forEach((k) => set.add(k));
    }
    return Array.from(set);
  }, [skus]);

  // master options map: field -> string[]
  const optionsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const f of fields) {
      const vals = new Set<string>();
      for (const s of skus) {
        const v = s.attributes?.[f];
        if (v) vals.add(v);
      }
      map[f] = Array.from(vals);
    }
    return map;
  }, [fields, skus]);

  // helper: ตรวจว่า option ใช้ได้ภายใต้ selection ปัจจุบัน
  const isOptionAvailable = (field: string, opt: string) => {
    return skus.some((sku) => {
      // ต้องตรงกับ options ที่เลือกไว้ทุกตัว (ยกเว้น field ปัจจุบัน)
      const okOtherFields = Object.entries(selectedOptions).every(([k, v]) => {
        if (k === field) return true;
        return (sku.attributes?.[k] ?? "") === v;
      });
      if (!okOtherFields) return false;
      // field ปัจจุบันต้องมีค่า opt
      return (sku.attributes?.[field] ?? "") === opt;
    });
  };

  // SKU ที่ match กับ selection (ถ้าเลือกครบทุก field)
  const matchedSku = useMemo(() => {
    if (!fields.length) {
      // ไม่มี fields (base SKU) -> ถ้ามี 1 ตัวก็ใช้ตัวนั้น
      return skus.length ? skus[0] : undefined;
    }
    // ต้องเลือกครบทุก field
    const allChosen = fields.every((f) => !!selectedOptions[f]);
    if (!allChosen) return undefined;

    return skus.find((sku) =>
      fields.every((f) => (sku.attributes?.[f] ?? "") === selectedOptions[f])
    );
  }, [fields, selectedOptions, skus]);

  const selectedPrice = matchedSku?.price ?? undefined;
  const selectedAvailable = matchedSku?.available; // อาจ undefined ถ้า BE ไม่ส่ง

  // ป้ายราคา: เลือกครบ -> ราคา SKU, ไม่ครบ -> ช่วงจาก product
  const priceLabel =
    selectedPrice != null
      ? `฿ ${fmt(selectedPrice)}`
      : product.priceFrom != null &&
        product.priceTo != null &&
        product.priceTo !== product.priceFrom
      ? `฿ ${fmt(product.priceFrom)} - ${fmt(product.priceTo)}`
      : `฿ ${fmt(product.priceFrom ?? product.priceTo)}`;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gray-900 rounded-lg max-w-4xl w-full h-auto relative transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 flex justify-end border-b border-gray-700">
          <button
            className="text-gray-400 hover:text-white text-2xl cursor-pointer"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>

        <div className="p-4 grid grid-cols-3 gap-4">
          {/* รูป */}
          <div className="col-span-1 w-full pl-6 pr-6">
            <Image
              src={product.image || "/no-image.png"}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-96 object-cover rounded border border-gray-700"
            />
          </div>

          {/* เนื้อหา */}
          <div className="col-span-2 w-full pl-6 pr-6">
            <h2 className="text-xl font-bold mb-2 text-white">
              {product.name}
            </h2>

            <div className="mb-2">
              <span className="text-green-400 font-semibold text-lg mt-4">
                {priceLabel}
              </span>
            </div>

            {/* ร้าน (ถ้ามีใน public DTO) */}
            {"store" in product && product.store?.name ? (
              <div className="mb-2">
                <h3 className="text-sm font-bold text-white/80">
                  Sold By:{" "}
                  <Link
                    href={`/stores/${
                      product.store?.slug ?? product.store?._id ?? ""
                    }`}
                    className="text-indigo-400 hover:underline"
                  >
                    {product.store?.name}
                  </Link>
                </h3>
              </div>
            ) : null}

            <div className="flex items-center text-yellow-400 text-lg mt-4">
              {[1, 2, 3, 4, 5].map((i) =>
                i <= Math.floor(mockStar) ? (
                  <FaStar key={i} />
                ) : i - 0.5 === mockStar ? (
                  <FaStarHalfAlt key={i} />
                ) : (
                  <FaRegStar key={i} />
                )
              )}
              <span className="ml-2 text-gray-400 text-sm">
                ({mockStar} / 5)
              </span>
            </div>

            <div className="flex items-center text-md mt-4">
              {product.description || "no description"}
            </div>

            <hr className="flex items-center text-md mt-4 text-gray-700" />

            {/* ตัวเลือก (ถ้ามี fields) */}
            <div className="mt-4 space-y-3">
              {loadingSkus && (
                <div className="text-sm text-gray-400">กำลังโหลดตัวเลือก…</div>
              )}
              {errorSkus && (
                <div className="text-sm text-red-400">{errorSkus}</div>
              )}

              {!loadingSkus &&
                !errorSkus &&
                fields.map((field) => {
                  const opts = optionsMap[field] ?? [];
                  if (!opts.length) return null;
                  return (
                    <div key={field}>
                      <span className="block text-white text-sm mb-2">
                        {field}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {opts.map((opt) => {
                          const available = isOptionAvailable(field, opt);
                          const active = selectedOptions[field] === opt;
                          return (
                            <button
                              key={opt}
                              disabled={!available}
                              className={`px-3 py-1 rounded border text-sm cursor-pointer ${
                                active
                                  ? "bg-blue-600 text-white border-blue-700"
                                  : available
                                  ? "border-gray-600 text-white hover:bg-gray-800"
                                  : "border-gray-700 text-gray-500 opacity-50"
                              }`}
                              onClick={() => {
                                setSelectedOptions((prev) => {
                                  // toggle: ถ้าเลือกอันเดิม → ลบออก
                                  if (prev[field] === opt) {
                                    const u = { ...prev };
                                    delete u[field];
                                    return u;
                                  }
                                  return { ...prev, [field]: opt };
                                });
                                setCount(1);
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* จำนวน / สต๊อก / ปุ่ม */}
            <div className="grid grid-cols-4 gap-4 mt-6 items-center">
              {/* จำนวน */}
              <div className="flex col-span-1">
                <div
                  className={`flex items-center justify-center w-full border border-gray-600 rounded px-4 py-2 ${
                    matchedSku ? "" : "opacity-50"
                  }`}
                >
                  <button
                    className={`text-lg font-bold text-white px-3 ${
                      !matchedSku ? "" : "cursor-pointer"
                    }`}
                    onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                    disabled={!matchedSku}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={count}
                    readOnly
                    className="w-10 text-center bg-transparent text-white outline-none mx-2"
                  />
                  <button
                    className={`text-lg font-bold text-white px-3 ${
                      matchedSku ? "cursor-pointer" : ""
                    }`}
                    onClick={() =>
                      setCount((prev) =>
                        selectedAvailable != null
                          ? Math.min(prev + 1, Math.max(1, selectedAvailable))
                          : prev + 1
                      )
                    }
                    disabled={!matchedSku}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* คงเหลือ */}
              <div className="min-w-[60px] px-2 py-2 rounded text-center text-white">
                <span className="text-sm">
                  คงเหลือ: {selectedAvailable != null ? selectedAvailable : "-"}
                </span>
              </div>

              {/* Add to Cart */}
              <div className="col-span-1">
                <button
                  className={`w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded transition-colors duration-300 ${
                    matchedSku
                      ? "hover:bg-gray-700 cursor-pointer"
                      : "opacity-50"
                  }`}
                  disabled={!matchedSku}
                  onClick={() => {
                    if (!matchedSku) return;
                    // ปรับตาม signature ของ useCart ของคุณ
                    // ตัวอย่าง: addToCart({ productId: product._id, skuId: matchedSku._id, qty: count })
                    addToCart(product, count);
                  }}
                >
                  Add to Cart
                </button>
              </div>

              {/* Wishlist */}
              <div className="col-span-1">
                <button
                  className={`w-full font-semibold py-3 px-4 rounded transition-colors duration-300 cursor-pointer ${
                    isWishlisted
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white"
                  }`}
                  onClick={() => setIsWishlisted((prev) => !prev)}
                >
                  {isWishlisted ? "❤️" : "🤍"}
                </button>
              </div>
            </div>

            {/* ไปหน้ารายละเอียด */}
            {/* <div className="mt-6">
              <Link
                className="text-indigo-400 hover:underline"
                href={`/products/${product._id}`}
              >
                ดูรายละเอียดสินค้า →
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
