// app/products/[type]/ProductListClient.tsx
"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product/product.types";
import FilterSidebar from "@/components/FilterSidebar";
import { ProductCategory } from "@/types/product/enums/product-category.enum";
import { ProductType } from "@/types/product/enums/product-type.enum";

type Props = {
  products: Product[];
};

const allFilters = {
  categories: Object.values(ProductCategory),
  tags: ["All", "Sale", "Popular", "New"],
  types: Object.values(ProductType),
};

export default function ProductListClient({ products }: Props) {
  const [filter, setFilter] = useState("");
  const [filters, setFilters] = useState({
    category: "All",
    tag: "All",
    type: "All",
  });

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory =
      filters.category === "All" || p.category === filters.category;
    const matchesType =
      filters.type === "All" ||
      !filters.type ||
      p.type.toLowerCase() === filters.type.toLowerCase();
    const matchesTag =
      filters.tag === "All" ||
      !filters.tag ||
      p.description.toLowerCase().includes(filters.tag.toLowerCase());

    return matchesSearch && matchesCategory && matchesType && matchesTag;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="md:w-1/4">
          <input
            type="text"
            placeholder="Search products..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            className="mb-4 p-2 border"
          />
          <FilterSidebar
            category="electronics"
            filters={allFilters}
            onFilterChange={(newFilters) => {
              // console.log(newFilters);
              setFilters({
                category: newFilters.category ?? filters.category ?? "",
                tag: newFilters.tag ?? filters.tag ?? "",
                type: newFilters.type ?? filters.type ?? "",
              });
            }}
          />
        </div>
        <div>
          <div>
            <div className="mb-4 p-2">sort</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
