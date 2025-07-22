import { getAllProducts } from "@/lib/products";
import { Product } from "@/types/product.types";
import Image from "next/image";
import Link from "next/link";

export default async function RecommendedItems() {
  let products: Product[] = [];
  products = await getAllProducts();
  // สุ่มลำดับสินค้า แล้วเลือก 3 รายการแรก (แก้จำนวนได้ตามต้องการ)
  const shuffled = products
    .map((p) => ({ sort: Math.random(), value: p }))
    .sort((a, b) => a.sort - b.sort)
    .map((p) => p.value);
  const recommendedItems = shuffled.slice(0, 3);

  return (
    <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Recommended Items</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {recommendedItems.map((item) => (
          <Link
            href={`/products/${item.id}`}
            key={item.id}
            className="group rounded-lg overflow-hidden shadow hover:shadow-lg transition border border-gray-700 hover:border-gray-500"
          >
            <div className="relative h-48 w-full">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="bg-white py-4 px-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {item.name}
              </h3>
              <h3 className="text-lg font-semibold text-gray-800">
                ฿{item.price}
              </h3>
              <span className="text-blue-500 text-sm group-hover:underline">
                View Details →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
