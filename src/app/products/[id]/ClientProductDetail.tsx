"use client";
import React, { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // ใส่ไว้ด้านบนของไฟล์
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { ProductBase } from "@/types/product/base/product-base.types";
import { extractCombinations, getAllVariantPrices } from "@/lib/functionTools";

const mockStart = 4.5; // ตัวอย่างค่า rating ที่ใช้แสดงดาว

export default function ClientProductDetail({
  product,
}: {
  product: ProductBase;
}) {
  console.log(product, "product");

  const prices = getAllVariantPrices(product.variants ?? []);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // สร้าง combinations ตอน render page/receive product
  const allCombinations = useMemo(
    () => extractCombinations(product.variants ?? []),
    [product]
  );
  console.log(allCombinations, "allCombinations");

  // หาทุก field จริง (Color/Size/Sex ...) อัตโนมัติ
  const allFields = useMemo(
    () =>
      Array.from(
        new Set(
          allCombinations.flatMap((c) =>
            Object.keys(c).filter((k) => !["_id", "price", "stock"].includes(k))
          )
        )
      ),
    [allCombinations]
  );

  const masterOptions: Record<string, string[]> = useMemo(() => {
    const opts: Record<string, string[]> = {};
    allFields.forEach((field) => {
      opts[field] = Array.from(
        new Set(allCombinations.map((c) => c[field]))
      ).filter(Boolean);
    });
    return opts;
  }, [allCombinations, allFields]);

  // ฟังก์ชัน filter ตัวเลือก option ตาม selection ปัจจุบัน
  function getAvailableOptionsForField(field: string) {
    const available = new Set(allCombinations.map((c) => c[field]));
    return (masterOptions[field] ?? []).filter((opt) => available.has(opt));
  }

  function isOptionAvailable(currentField: string, opt: string) {
    return allCombinations.some(
      (comb) =>
        Object.entries(selectedOptions).every(([k, v]) =>
          k === currentField ? true : comb[k] === v
        ) && comb[currentField] === opt
    );
  }

  // หาคู่ selected ปัจจุบัน (เอา price/stock)
  const matched = allCombinations.find((comb) => {
    // filter เอาแต่ field จริง (ไม่เอา _id, price, stock)
    const fields = Object.keys(comb).filter(
      (k) => !["_id", "price", "stock"].includes(k)
    );
    // ต้องเลือกครบทุก field ของ combination นั้น
    return (
      fields.every((f) => selectedOptions[f]) &&
      fields.every((f) => selectedOptions[f] === comb[f])
    );
  });

  const selectedPrice = matched?.price;
  const selectedStock = matched?.stock ?? 0;

  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) {
    notFound();
  }
  function addToCart(product: ProductBase, count: number): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <div className="w-full pl-6 pr-6">
        <Image
          src={product?.image || "/no-image.png"}
          alt={product.name}
          width={400}
          height={300}
          className="w-full h-96 object-cover rounded border-1 border-solid border-gray-600"
        />
      </div>
      <div className="w-full pl-6 pr-6">
        <h2 className="text-xl font-bold mb-2 text-white">{product.name}</h2>
        <div className="mb-2">
          <span className="text-green-600 font-semibold text-lg mt-4">
            {selectedPrice !== undefined
              ? `฿ ${selectedPrice.toLocaleString()}`
              : prices.length > 1
              ? `฿ ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`
              : `฿ ${minPrice.toLocaleString()}`}
          </span>
        </div>
        <div className="mb-2">
          <h3 className="text-md font-bold text-sm">
            Sold By:{" "}
            <Link
              href={`/stores/${product.store._id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              {product.store.name}
            </Link>
          </h3>
        </div>
        <div className="flex items-center text-yellow-400 text-lg mt-4">
          {[1, 2, 3, 4, 5].map((i) =>
            i <= Math.floor(mockStart) ? (
              <FaStar key={i} />
            ) : i - 0.5 === mockStart ? (
              <FaStarHalfAlt key={i} />
            ) : (
              <FaRegStar key={i} />
            )
          )}
          <span className="ml-2 text-lg text-gray-400">({mockStart} / 5)</span>
        </div>
        <div className="pb-8 mt-4 mb-4 border-b-1 border-solid border-gray-600">
          <span className="text-white text-ld">{product.description}</span>
        </div>
        {allFields.map((field) => {
          const options = getAvailableOptionsForField(field).filter(Boolean);
          console.log(options, "options");

          return (
            <div key={field} className="mb-2">
              <span className="block text-md text-white pb-2">{field}</span>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt}
                    disabled={!isOptionAvailable(field, opt)}
                    className={`px-3 py-1 rounded border text-sm 
                          ${
                            selectedOptions[field] === opt
                              ? "bg-blue-600 text-white border-blue-700"
                              : !isOptionAvailable(field, opt)
                              ? ""
                              : "border-gray-400 text-white hover:bg-gray-700"
                          }
                          ${
                            !isOptionAvailable(field, opt)
                              ? "opacity-50"
                              : "cursor-pointer"
                          }
                        `}
                    onClick={() => {
                      setSelectedOptions((prev) => {
                        // toggle: ถ้าเลือกอันเดิม → ลบ key ทิ้งเลย
                        if (prev[field] === opt) {
                          // ลบ field ออกจาก object
                          const updated = { ...prev };
                          delete updated[field];
                          return updated;
                        }
                        // เลือกใหม่/เปลี่ยน
                        return {
                          ...prev,
                          [field]: opt,
                        };
                      });

                      if (matched) {
                        setCount(1);
                      }
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <div className="grid grid-cols-4 gap-4 mt-6 items-center">
          {/* กล่องจำนวน */}
          <div className="flex col-span-1">
            <div
              className={`flex items-center justify-center w-full border border-gray-600 rounded px-4 py-2 ${
                matched ? "" : "opacity-50"
              }`}
            >
              <button
                className={`text-lg font-bold text-white px-3 ${
                  matched ? "cursor-pointer" : ""
                }`}
                onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                disabled={matched ? false : true}
              >
                -
              </button>
              <input
                type="text"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-10 text-center bg-transparent text-white outline-none mx-2"
                disabled
              />
              <button
                className={`text-lg font-bold text-white px-3 ${
                  matched ? "cursor-pointer" : ""
                }`}
                onClick={() =>
                  count < selectedStock ? setCount((prev) => prev + 1) : ""
                }
                disabled={matched ? false : true}
              >
                +
              </button>
            </div>
          </div>

          <div className="min-w-[60px] px-2 py-2 rounded text-center bg-transparent text-white">
            <span className="text-sm">คงเหลือ: {selectedStock ?? "-"}</span>
          </div>

          {/* ปุ่ม Add to Cart */}
          <div className="col-span-1">
            <button
              className={`w-full bg-gray-800 text-white font-semibold py-3 px-4 rounded transition-colors duration-300 ${
                selectedPrice !== undefined
                  ? "cursor-pointer hover:bg-gray-700"
                  : "opacity-50"
              }`}
              onClick={() => addToCart(product, count)}
              disabled={selectedPrice !== undefined ? false : true}
            >
              Add to Cart
            </button>
          </div>

          {/* ปุ่ม Buy Now */}
          <div className="col-span-1">
            <button
              className={`w-full font-semibold py-3 px-4 rounded transition-colors duration-300 ${
                isWishlisted
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
              onClick={() => {
                setIsWishlisted((prev) => !prev);
                console.log(count);
              }}
            >
              {isWishlisted ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
        <div className="mt-6">
          <span className="text-gray-500 text-md font-semibold">
            Categories : {product.category}
          </span>
        </div>
        <div className="mt-2">
          <span className="text-gray-500 text-md font-semibold">
            Tags : {product.type}
          </span>
        </div>
      </div>
    </div>
  );
}
