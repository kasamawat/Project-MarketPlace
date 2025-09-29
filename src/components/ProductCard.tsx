// app/products/[type]/ProductCard.tsx
"use client";

import { PublicProduct } from "@/types/product/products.types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ProductPreviewModal from "./modals/ProductPreviewModal";
// ถ้ายังอยากมี Preview modal ให้ปรับ modal ให้รองรับ PublicProduct ด้วย
// import ProductPreviewModal from "@/components/modals/ProductPreviewModal";

const fmt = (n?: number) =>
  typeof n === "number"
    ? n.toLocaleString("th-TH", { minimumFractionDigits: 0 })
    : "—";

export default function ProductCard({ product }: { product: PublicProduct }) {
  const [onHover, setOnHover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const hasRange =
    product.priceFrom != null &&
    product.priceTo != null &&
    product.priceTo !== product.priceFrom;

  const priceLabel = hasRange
    ? `฿ ${fmt(product.priceFrom)} - ${fmt(product.priceTo)}`
    : `฿ ${fmt(product.priceFrom ?? product.priceTo)}`;

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div
            className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900 hover:shadow-lg transition cursor-pointer"
            onMouseOver={() => setOnHover(true)}
            onMouseOut={() => setOnHover(false)}
          >
            <Link
              href={`/products/${product._id}`}
              className="block rounded-lg overflow-hidden"
            >
              <Image
                src={product.image || product?.cover?.url || "/no-image.png"}
                alt={product.name}
                width={400}
                height={300}
                className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* ✅ absolute overlay ทับรูปด้านล่าง */}
            <div
              className={[
                // ตำแหน่ง overlay
                "absolute inset-x-0 bottom-0 z-10",
                // พื้นหลังโปร่ง + blur นิดๆ
                "bg-gray-500/60 backdrop-blur-sm",
                // layout ปุ่ม
                "flex justify-between items-center text-white text-sm",
                // "px-3 py-2",
                // เลื่อนลงซ่อน + เลื่อนขึ้นโชว์ตาม onHover เดิม
                "transform transition-transform duration-200",
                onHover ? "translate-y-0" : "translate-y-full",
              ].join(" ")}
            >
              <button
                type="button"
                className="w-1/4 text-center cursor-pointer hover:bg-black/30 px-3 py-2"
                onClick={() =>
                  console.log(`Wish ${product._id} : ${product.name}`)
                }
                title="Wishlist"
              >
                ❤️
              </button>

              <Link
                href={`/products/${product._id}`}
                className="w-2/4 text-center hover:bg-black/30 px-3 py-2"
              >
                View Details
              </Link>

              <button
                type="button"
                className="w-1/4 text-center cursor-pointer hover:bg-black/30 px-3 py-2"
                onClick={() => {
                  console.log(`Preview ${product._id} : ${product.name}`);
                  setShowPreview(true);
                }}
                title="Preview"
              >
                🔍
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-white font-semibold text-lg line-clamp-2">
            {product.name}
          </h2>
          <p className="text-green-400 mt-1 font-bold">{priceLabel}</p>
          {product.skuCount > 1 && (
            <p className="text-xs text-gray-400 mt-1">
              {product.skuCount} ตัวเลือก
            </p>
          )}
        </div>
      </div>

      {/* ถ้าจะมี Preview modal ให้ปรับ modal ให้รับ PublicProduct */}
      {showPreview && (
        <ProductPreviewModal
          product={product} // ต้องเปลี่ยนชนิดให้รองรับ PublicProduct
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
