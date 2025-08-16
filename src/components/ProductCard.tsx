// app/products/[type]/ProductCard.tsx
"use client";

import { PublicProduct } from "@/types/product/products.types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ProductPreviewModal from "./modals/ProductPreviewModal";
// ถ้ายังอยากมี Preview modal ให้ปรับ modal ให้รองรับ PublicProduct ด้วย
// import ProductPreviewModal from "@/components/modals/ProductPreviewModal";

const styles = {
  actionHidden: "opacity-0 transition-opacity duration-500",
  actionVisible: "opacity-100 transition-opacity duration-500",
  actionButton:
    "h-10 flex justify-center items-center text-sm bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-300",
};

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
        <div
          className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900 hover:shadow-lg transition cursor-pointer"
          onMouseOver={() => setOnHover(true)}
          onMouseOut={() => setOnHover(false)}
        >
          <Link
            href={`/products/${product._id}`}
            className="group rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            <Image
              src={product.image || "/no-image.png"}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <div
            className={`product-action flex justify-between ${
              onHover ? styles.actionVisible : styles.actionHidden
            }`}
          >
            <div
              className={`w-1/6 ${styles.actionButton} border-r border-gray-900`}
              onClick={() =>
                console.log(`Wish ${product._id} : ${product.name}`)
              }
            >
              ❤️
            </div>
            <Link
              href={`/products/${product._id}`}
              className={`w-4/6 ${styles.actionButton}`}
            >
              View Details
            </Link>
            <div
              className={`w-1/6 ${styles.actionButton} border-l border-gray-900`}
              onClick={() => {
                console.log(`Preview ${product._id} : ${product.name}`);
                setShowPreview(true);
              }}
            >
              🔍
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
