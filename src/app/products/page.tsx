import Breadcrumbs from "@/components/Breadcrumbs";
import { Product } from "@/types/product/product.types";
import { getAllProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductListClient from "./ProductListClient";

export default async function ProductListPage() {
  let products: Product[] = [];

  try {
    console.log(`${process.env.NEXT_PUBLIC_API_URL}/public/products`,'`${process.env.NEXT_PUBLIC_API_URL}/products/public`');
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/public/products`,
      {
        method: "GET",
        cache: "no-store", // เพื่อให้ดึงข้อมูลสดทุกครั้ง
      }
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    products = await res.json();
  } catch (error) {
    // handle error หรือ log ได้
    console.log(error);

    products = [];
  }

  if (products.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* อาจใส่ Breadcrumbs หรือ title ตรงนี้ */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs
          paths={[
            { name: "HOME", href: "/", status: "link" },
            { name: "PRODUCTS", href: "/products", status: "disabled" },
          ]}
        />
      </div>
      <ProductListClient products={products} />
    </div>
  );
}
