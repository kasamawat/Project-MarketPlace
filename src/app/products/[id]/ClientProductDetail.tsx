"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // ใส่ไว้ด้านบนของไฟล์
import Link from "next/link";
import { PublicProduct, SkuPublic } from "@/types/product/products.types";
import { useCart } from "@/app/context/CartContext";

type Props = {
  product: PublicProduct;
  skus: SkuPublic[];
};
// ใช้ Record แทน Attrs เพื่อให้ชัดเจนว่าเป็น key-value pairs
type Attrs = Record<string, string>;

const isPartialMatch = (attrs: Attrs = {}, selected: Attrs = {}) =>
  Object.entries(selected).every(([k, v]) => !v || attrs[k] === v);

const isExactMatch = (attrs: Attrs = {}, selected: Attrs = {}) =>
  Object.keys(attrs).length === Object.keys(selected).length &&
  isPartialMatch(attrs, selected);

const mockStar = 4.5;
const fmt = (n?: number) =>
  typeof n === "number"
    ? n.toLocaleString("th-TH", { minimumFractionDigits: 0 })
    : "—";

const getSkuPrimaryUrl = (s: SkuPublic) =>
  s?.cover?.url || s?.images?.[0]?.url || s?.image || "";

export default function ClientProductDetail({ product, skus }: Props) {
  console.log(product, "product");
  console.log(skus, "skus");

  const { addToCart } = useCart();

  // ----- local states -----
  const [count, setCount] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ตัวเลือกที่ผู้ใช้เลือก
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // For image
  const pageSize = 4;
  const [activeIdx, setActiveIdx] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);

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

  const optionAvailMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const f of fields) {
      map[f] = {};
      const opts = optionsMap[f] ?? [];
      for (const opt of opts) {
        const total = skus
          .filter((s) => s.purchasable !== false)
          .filter((s) => (s.attributes?.[f] ?? "") === opt)
          .filter((s) =>
            Object.entries(selectedOptions).every(([k, v]) =>
              k === f ? true : (s.attributes?.[k] ?? "") === v
            )
          )
          .reduce((sum, s) => sum + Math.max(0, s.available ?? 0), 0);
        map[f][opt] = total;
      }
    }
    return map;
  }, [skus, selectedOptions, fields, optionsMap]);

  // base SKU = attributes ว่าง {}
  const baseSku = useMemo(
    () => skus.find((s) => Object.keys(s.attributes ?? {}).length === 0),
    [skus]
  );

  // 1) หา SKU ที่ “ตรงครบทุก field” เพื่อใช้ Add to Cart
  const matchedSku = useMemo(() => {
    if (!fields.length) return baseSku ?? skus[0]; // ไม่มี fields = สินค้าเดี่ยว
    const allChosen = fields.every((f) => !!selectedOptions[f]);
    if (!allChosen) return undefined; // ยังเลือกไม่ครบ -> ยังไม่ผูกกับ SKU ใด
    return skus.find(
      (s) =>
        s.purchasable !== false && isExactMatch(s.attributes, selectedOptions)
    );
  }, [fields, selectedOptions, skus, baseSku]);

  // 2) ยอดคงเหลือรวมของ “ตัวที่แมตช์ตามสิ่งที่เลือก (partial)”
  const availableForSelection = useMemo(() => {
    if (!fields.length) return Math.max(0, baseSku?.available ?? 0);
    return skus
      .filter((s) => s.purchasable !== false)
      .filter((s) => isPartialMatch(s.attributes, selectedOptions))
      .reduce((sum, s) => sum + Math.max(0, s.available ?? 0), 0);
  }, [fields, selectedOptions, skus, baseSku]);

  const selectedPrice = matchedSku?.price ?? undefined;
  const selectedAvailable = availableForSelection; // อาจ undefined ถ้า BE ไม่ส่ง

  // ป้ายราคา: เลือกครบ -> ราคา SKU, ไม่ครบ -> ช่วงจาก product
  const priceLabel =
    selectedPrice != null
      ? `฿ ${fmt(selectedPrice)}`
      : product.priceFrom != null &&
        product.priceTo != null &&
        product.priceTo !== product.priceFrom
      ? `฿ ${fmt(product.priceFrom)} - ${fmt(product.priceTo)}`
      : `฿ ${fmt(product.priceFrom ?? product.priceTo)}`;

  // สร้างลิสต์แกลเลอรี (เหมือนเดิม)
  const gallery = useMemo(() => {
    const urls: string[] = [];
    if (product.cover?.url) urls.push(product.cover.url);
    if (product.image) urls.push(product.image);
    for (const s of skus) {
      const u = s?.cover?.url || s?.images?.[0]?.url || s?.image || "";
      if (u) urls.push(u);
    }
    return Array.from(new Set(urls)); // unique ตามลำดับเดิม
  }, [product.cover?.url, product.image, skus]);

  // รีเซ็ต/ปรับ thumbStart ให้ถูกเมื่อจำนวนรูปเปลี่ยน และให้ active อยู่ในหน้าต่างเสมอ
  useEffect(() => {
    if (!gallery.length) return;

    // 1) exact match ก่อน
    if (matchedSku) {
      const u = getSkuPrimaryUrl(matchedSku);
      if (u) {
        const idx = gallery.indexOf(u);
        if (idx >= 0) {
          setActiveIdx(idx);
          return;
        }
      }
    }

    // 2) partial match (ตรงตามที่เลือกบางส่วน)
    const partialUrls = skus
      .filter((s) => s.purchasable !== false)
      .filter((s) => isPartialMatch(s.attributes, selectedOptions))
      .map(getSkuPrimaryUrl)
      .filter(Boolean) as string[];

    for (const u of partialUrls) {
      const idx = gallery.indexOf(u);
      if (idx >= 0) {
        setActiveIdx(idx);
        return;
      }
    }

    // 3) ไม่พบ → คงรูปเดิม
  }, [selectedOptions, matchedSku, skus, gallery]);

  // thumbnails 4 ช่องปัจจุบัน (เลื่อนทีละ 1, วนรอบ)
  const thumbs = useMemo(() => {
    const n = gallery.length;
    if (!n) return [];
    const count = Math.min(pageSize, n);
    return Array.from({ length: count }, (_, i) => {
      const idx = (thumbStart + i) % n;
      return { idx, url: gallery[idx] };
    });
  }, [gallery, thumbStart]);

  // ปุ่มเลื่อนซ้าย/ขวา (ทีละ 1, วนรอบ)
  const canSlide = gallery.length > pageSize;
  const slideLeft = () =>
    setThumbStart((s) => (s - 1 + gallery.length) % gallery.length);
  const slideRight = () => setThumbStart((s) => (s + 1) % gallery.length);

  // helper: เช็คว่าดัชนีอยู่ในหน้าต่าง thumbnail ปัจจุบันไหม
  const isInThumbWindow = (idx: number, start: number) => {
    const n = gallery.length;
    const count = Math.min(pageSize, n);
    for (let i = 0; i < count; i++) {
      if ((start + i) % n === idx) return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <div className="p-4 grid grid-cols-5 gap-4">
        {/* รูป + แกลเลอรี (ไม่สกรอลล์) */}
        <div className="col-span-2 w-full px-2">
          {/* รูปใหญ่ พร้อมปุ่มซ้าย/ขวา เปลี่ยนทีละรูป */}
          <div className="relative w-full aspect-[1] rounded border border-gray-700 overflow-hidden">
            <Image
              src={gallery[activeIdx] || "/no-image.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              unoptimized
              loader={(p) => p.src}
            />

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const n = gallery.length;
                    if (!n) return;
                    setActiveIdx((prev) => {
                      const next = (prev - 1 + n) % n;
                      setThumbStart((s) =>
                        isInThumbWindow(next, s) ? s : (s - 1 + n) % n
                      );
                      return next;
                    });
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer"
                  aria-label="Previous image"
                  title="ก่อนหน้า"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const n = gallery.length;
                    if (!n) return;
                    setActiveIdx((prev) => {
                      const next = (prev + 1) % n;
                      setThumbStart((s) =>
                        isInThumbWindow(next, s) ? s : (s + 1) % n
                      );
                      return next;
                    });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/60 cursor-pointer"
                  aria-label="Next image"
                  title="ถัดไป"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* แถว thumbnails โชว์สูงสุด 4 รูป พร้อมปุ่มเลื่อนหน้า */}
          {gallery.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                disabled={!canSlide}
                onClick={slideLeft}
                className={`h-8 w-8 rounded bg-gray-800 text-white flex items-center justify-center ${
                  canSlide
                    ? "hover:bg-gray-700 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
                aria-label="ก่อนหน้า"
              >
                ‹
              </button>

              {thumbs.map(({ url, idx }) => (
                <button
                  key={`${idx}-${url}`}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`relative h-16 w-16 flex-none rounded overflow-hidden border ${
                    idx === activeIdx
                      ? "border-indigo-500 ring-2 ring-indigo-500"
                      : "border-gray-700 hover:border-gray-500 cursor-pointer"
                  }`}
                  title={`ภาพ ${idx + 1}`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                    loader={(p) => p.src}
                  />
                </button>
              ))}

              <button
                type="button"
                disabled={!canSlide}
                onClick={slideRight}
                className={`h-8 w-8 rounded bg-gray-800 text-white flex items-center justify-center ${
                  canSlide
                    ? "hover:bg-gray-700 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
                aria-label="ถัดไป"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* เนื้อหา */}
        <div className="col-span-3 w-full pl-6 pr-6">
          <h2 className="text-xl font-bold mb-2 text-white">{product.name}</h2>

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
            <span className="ml-2 text-gray-400 text-sm">({mockStar} / 5)</span>
          </div>

          <div className="flex items-center text-md mt-4">
            {product.description || "no description"}
          </div>

          <hr className="flex items-center text-md mt-4 text-gray-700" />

          {/* ตัวเลือก (ถ้ามี fields) */}
          <div className="mt-4 space-y-3">
            {fields.map((field) => {
              const opts = optionsMap[field] ?? [];
              if (!opts.length) return null;
              return (
                <div key={field}>
                  <span className="block text-white text-sm mb-2">{field}</span>
                  <div className="flex flex-wrap gap-2">
                    {opts.map((opt) => {
                      const count = optionAvailMap[field][opt] ?? 0;
                      const available = count > 0;
                      // const available = isOptionAvailable(field, opt);
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
                  className={`text-lg font-bold text-white ${
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
                  className={`text-lg font-bold text-white ${
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
                  matchedSku ? "hover:bg-gray-700 cursor-pointer" : "opacity-50"
                }`}
                disabled={!matchedSku || (matchedSku.available ?? 0) < 1}
                onClick={() => {
                  if (!matchedSku) return;
                  // ปรับตาม signature ของ useCart ของคุณ
                  // ตัวอย่าง: addToCart({ productId: product._id, skuId: matchedSku._id, qty: count })
                  addToCart({
                    product: {
                      _id: product._id,
                      name: product.name,
                      image: product.image,
                      store: product.store, // { id/slug/name } ถ้ามี
                      cover: product.cover,
                      skuCount: skus.length,
                    },
                    sku: matchedSku,
                    quantity: count,
                  });
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
  );
}
