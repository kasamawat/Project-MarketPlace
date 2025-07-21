// app/products/[type]/page.tsx
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductListClient from "./ProductListClient";
import {
  getElectronicsProducts,
  getFashionProducts,
  getFurnitureProducts,
} from "@/lib/products";
import { Product } from "@/types/product.types";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

type Props = {
  params: {
    type: string;
  };
};

export default async function ProductsByTypePage({ params }: Props) {
  const { type } = await params;
  const type_ = type.toLowerCase();
  let products: Product[] = [];

  switch (type_) {
    case "electronics":
      products = await getElectronicsProducts();
      break;
    case "fashion":
      products = await getFashionProducts();
      break;
    case "furniture":
      products = await getFurnitureProducts();
      break;
    default:
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
            {
              name: type_.charAt(0).toUpperCase() + type_.slice(1),
              href: `/products/${type_}`,
              status: "link",
            },
          ]}
        />
      </div>
      <ProductListClient products={products} />
    </div>
  );
}
