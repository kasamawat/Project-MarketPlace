"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Product } from "@/lib/products";

const categories = ["All", "Chair", "Sofa", "Table", "Bookshelf"];

export default function FurnitureClient({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState("All");

  const filteredProducts =
    selected === "All" ? products : products.filter((p) => p.type === selected);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        paths={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: "Furniture", href: "/products/furniture" },
        ]}
      />

      <h1 className="text-3xl font-bold mb-4">Furniture</h1>

      <div className="mb-6 flex flex-wrap gap-3 h-full">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`px-4 py-2 rounded-full border ${
              selected === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
