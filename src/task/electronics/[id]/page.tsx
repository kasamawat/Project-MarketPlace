// app/products/electronics/[id]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import { getProduct } from "@/lib/products";
import { ProductType } from "@/types/product.types";

type Product = {
  id: number;
  name: string;
  category: string;
  type: string;
  image: string;
  price: number;
};

type Props = {
  params: {
    type: ProductType;
    id: string;
  };
};

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.type, params.id);
  console.log(params, "params");

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Image
        src={product.image}
        alt={product.name}
        width={800}
        height={600}
        className="w-full h-auto object-cover rounded-md shadow"
      />
      <h1 className="mt-6 text-3xl font-bold text-white">{product.name}</h1>
      <p className="text-green-400 text-xl font-semibold mt-2">
        ฿{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p className="text-gray-400 mt-4">Category: {product.category}</p>
      <p className="text-gray-400">Type: {product.type}</p>
    </div>
  );
}
