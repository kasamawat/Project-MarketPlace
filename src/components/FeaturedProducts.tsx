import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  href: string;
};

const featuredProducts: Product[] = [
  {
    id: "p1",
    name: "Smartphone XYZ",
    image: "/images/products/smartphone.jpg",
    price: 15900,
    href: "/products/electronic/smartphone-xyz",
  },
  {
    id: "p2",
    name: "Stylish Jacket",
    image: "/images/products/jacket.jpg",
    price: 2900,
    href: "/products/fashion/stylish-jacket",
  },
  {
    id: "p3",
    name: "Modern Sofa",
    image: "/images/products/sofa.jpg",
    price: 8990,
    href: "/products/furniture/modern-sofa",
  },
];

export default function FeaturedProducts(): React.ReactElement {
  return (
    <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Featured Products</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {featuredProducts.map(({ id, name, image, price, href }) => (
          <Link
            href={href}
            key={id}
            className="group border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            <div className="relative h-64 w-full">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{name}</h3>
              <p className="text-indigo-600 font-bold text-xl">
                {price.toLocaleString()} ฿
              </p>
              <button className="mt-3 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
                ซื้อเลย
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
