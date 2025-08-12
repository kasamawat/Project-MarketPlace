"use client";

import Image from "next/image";
import { useState } from "react";
import ProductPreviewModal from "@/components/modals/ProductPreviewModal";
// import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { Product } from "@/types/product/product.types";
import { getAllVariantPrices } from "@/lib/functionTools";
import { ProductBase } from "@/types/product/base/product-base.types";

const styles = {
  actionHidden: "opacity-0 transition-opacity duration-500",
  actionVisible: "opacity-100 transition-opacity duration-500",
  actionButton:
    "h-10 flex justify-center items-center text-sm bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-300",
};

export default function ProductCard({ product }: { product: ProductBase }) {
  // const { addToCart } = useCart();
  const [onHover, setOnHover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const prices = getAllVariantPrices(product.variants ?? []);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

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
              src={product?.image || "/no-image.png"}
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
                console.log(`Link ${product._id} : ${product.name}`)
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
                console.log(`PreView ${product._id} : ${product.name}`);
                setShowPreview(true);
              }}
            >
              🔍
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-white font-semibold text-lg">{product.name}</h2>
          <p className="text-green-400 mt-1 font-bold">
            {prices.length > 1
              ? `฿ ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`
              : `฿ ${minPrice.toLocaleString()}`}
          </p>
        </div>
      </div>
      {showPreview && (
        <ProductPreviewModal
          product={product}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
