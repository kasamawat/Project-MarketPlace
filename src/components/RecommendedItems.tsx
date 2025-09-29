import Image from "next/image";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { PublicProduct } from "@/types/product/products.types";

export default async function RecommendedItems() {
  const products: PublicProduct[] = [];
  // products = await getAllProducts();
  // สุ่มลำดับสินค้า แล้วเลือก 3 รายการแรก (แก้จำนวนได้ตามต้องการ)
  const shuffled = products
    .map((p) => ({ sort: Math.random(), value: p }))
    .sort((a, b) => a.sort - b.sort)
    .map((p) => p.value);
  const recommendedItems = shuffled.slice(0, 6);

  return (
    <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-10 text-center">Recommended Items</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {recommendedItems.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
