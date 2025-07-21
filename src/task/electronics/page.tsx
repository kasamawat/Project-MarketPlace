"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { getElectronicsProducts, Product } from "@/lib/products";
import { useState, useEffect } from "react";

const allFilters = {
  categories: ["Smartphones", "Laptops", "TVs"],
  tags: ["Sale", "Popular", "New"],
  types: ["Budget", "Premium", "Gaming"],
};

export default function ElectronicsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    tag: "",
    type: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getElectronicsProducts();
      setProducts(data);
    };

    fetchData();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        paths={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: "Electronics", href: "/products/electronics" },
        ]}
      />

      <h1 className="text-3xl font-bold mb-6">Electronics</h1>

      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="md:w-1/4">
          <FilterSidebar
            category="electronics"
            filters={allFilters}
            onFilterChange={setFilters}
          />
        </div>
        <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
