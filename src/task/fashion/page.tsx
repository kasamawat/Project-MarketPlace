"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard"; // สมมุติว่าคุณมี component นี้แล้ว
import { getFashionProducts, Product } from "@/lib/products"; // ฟังก์ชันจำลองสำหรับดึงข้อมูลสินค้า
import { useEffect, useState } from "react";

export default function FashionPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFashionProducts(); // ดึงข้อมูลสินค้าจากฟังก์ชันที่คุณสร้าง
      setProducts(data);
    };

    fetchData();
  },[]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        paths={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: "Fashion", href: "/products/fashion" },
        ]}
      />

      <h1 className="text-3xl font-bold mb-6">Fashion</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
