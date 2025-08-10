// components/ProductPreviewModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/types/product/product.types";
import Link from "next/link";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { getAllVariantPrices, extractCombinations } from "@/lib/functionTools";

type Props = {
  product: Product;
  onClose: () => void;
};

const mockStart = 4.5;

const ProductPreviewModal = ({
  product,
  onClose,
}: Props): React.ReactElement => {
  const { addToCart } = useCart();
  // console.log(product, "product");

  const prices = getAllVariantPrices(product.variants ?? []);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  // console.log(selectedOptions, "selectedOptions");

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

  console.log(allFields, "allFields");

  const masterOptions: Record<string, string[]> = useMemo(() => {
    const opts: Record<string, string[]> = {};
    allFields.forEach((field) => {
      opts[field] = Array.from(
        new Set(allCombinations.map((c) => c[field]))
      ).filter(Boolean);
    });
    return opts;
  }, [allCombinations, allFields]);

  // console.log(masterOptions, "masterOptions");

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

  console.log(selectedOptions, "selectedOptions");

  console.log(matched, "matched");

  const selectedPrice = matched?.price ?? 0;
  const selectedStock = matched?.stock ?? 0;
  // const selectedPrice = lastSelectedVariant?.price;

  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
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
        <div className="p-2 flex justify-end border-b-1 border-solid border-gray-600">
          <button
            className={`text-gray-500 hover:text-gray-700 text-2xl cursor-pointer`}
            onClick={handleClose}
          >
            &times;
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-4">
          <div className="col-span-1 sm:col-span-1 pl-2 pr-2">
            <Image
              src={product.image ?? "/no-image.png"}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-96 object-cover rounded border-1 border-solid border-gray-600"
            />
          </div>
          <div className="col-span-2 sm:col-span-2 pl-2 pr-2">
            <h2 className="text-xl font-bold mb-2 text-white">
              {product.name}
            </h2>
            <div className="mb-2">
              <span className="text-green-600 font-semibold text-lg mt-4">
                {selectedPrice !== undefined
                  ? `฿ ${selectedPrice.toLocaleString()}`
                  : prices.length > 1
                  ? `฿ ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`
                  : `฿ ${minPrice.toLocaleString()}`}
                {/* {prices.length > 1
                  ? `฿ ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`
                  : `฿ ${minPrice.toLocaleString()}`} */}
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
              <span className="ml-2 text-lg text-gray-400">
                ({mockStart} / 5)
              </span>
            </div>
            <div className="pb-8 mt-4 mb-4 border-b-1 border-solid border-gray-600">
              <span className="text-white text-sm">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
                ut asperiores rem consectetur quae suscipit sint dicta excepturi
                totam ipsum, voluptate rerum cumque iure veritatis illum sequi
                commodi ullam enim.
              </span>
            </div>
            {allFields.map((field) => {
              const options =
                getAvailableOptionsForField(field).filter(Boolean);
              console.log(options, "options");

              return (
                <div key={field} className="mb-2">
                  {/* {options.length === 0 ? null : (
                    <>
                    </>
                  )} */}
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
                              : (!isOptionAvailable(field, opt) ? "" : "border-gray-400 text-white hover:bg-gray-700")
                          }
                          ${
                            !isOptionAvailable(field, opt) ? "opacity-50" : "cursor-pointer"
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
                    onClick={() => (count < selectedStock) ? setCount((prev) => prev + 1) : ""}
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
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded transition-colors duration-300 cursor-pointer"
                  onClick={() => addToCart(product, count)}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal;
