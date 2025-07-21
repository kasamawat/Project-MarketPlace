import { getProduct } from "@/lib/products";
import { ProductType } from "@/types/product.types";
import notFound from "./not-found";
import ClientProductDetail from "./ClientProductDetail";

type Props = {
  params: {
    type: ProductType;
    id: string;
  };
};

// Server Component
export default async function ProductDetailPage({ params }: Props) {
  const { type, id } = await params;
  const product = await getProduct(type.toLowerCase() as ProductType, id);

  if (!product) return notFound(); // ✅ ใส่ return

  return <ClientProductDetail product={product} type={type} />;
}