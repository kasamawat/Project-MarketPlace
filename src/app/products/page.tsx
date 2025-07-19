import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Electronics",
    image: "/images/electronics.jpg",
    href: "/products/electronics",
  },
  {
    name: "Fashion",
    image: "/images/fashion.jpg",
    href: "/products/fashion",
  },
  {
    name: "Furniture",
    image: "/images/furniture.jpg",
    href: "/products/furniture",
  },
];

export default function ProductListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        paths={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {/* <p>กำลังโหลดสินค้าจาก backend (เร็วๆ นี้)...</p> */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {categories.map((cat) => (
          <Link
            href={cat.href}
            scroll={true}
            key={cat.name}
            className="group rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            <div className="relative h-48 w-full">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="bg-white py-4 px-6 text-center">
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <span className="text-blue-500 text-sm group-hover:underline">
                Shop now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
