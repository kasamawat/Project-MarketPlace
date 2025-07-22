// app/products/[type]/ProductListClient.tsx
"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product.types";
import FilterSidebar from "@/components/FilterSidebar";

type Props = {
  products: Product[];
};

const allFilters = {
  categories: ["Smartphones", "Laptops", "TVs"],
  tags: ["Sale", "Popular", "New"],
  types: ["Budget", "Premium", "Gaming"],
};

export default function ProductListClient({ products }: Props) {
  const [filter, setFilter] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    tag: "",
    type: "",
  });

  // ตัวอย่าง filter แบบง่าย
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="md:w-1/4">
          <input
            type="text"
            placeholder="Search products..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-4 p-2 border"
          />
          <FilterSidebar
            category="electronics"
            filters={allFilters}
            onFilterChange={(newFilters) =>
              setFilters({
                category: newFilters.category ?? "",
                tag: newFilters.tag ?? "",
                type: newFilters.type ?? "",
              })
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
