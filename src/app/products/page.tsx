import Breadcrumbs from "@/components/Breadcrumbs";
import { Product } from "@/types/product.types";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductListClient from "./ProductListClient";

export default async function ProductListPage() {
  let products: Product[] = [];
  products = await getAllProducts();
  if (products.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* อาจใส่ Breadcrumbs หรือ title ตรงนี้ */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs
          paths={[
            { name: "Home", href: "/", status: "link" },
            { name: "Products", href: "/products", status: "link" },
          ]}
        />
      </div>
      <ProductListClient products={products} />
    </div>
  );
}
