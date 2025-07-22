import { getProduct } from "@/lib/products";
import notFound from "./not-found";
import ClientProductDetail from "./ClientProductDetail";

type Props = {
  params: {
    id: string;
  };
};

// Server Component
export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  console.log(await params, "params");
  
  const product = await getProduct(id);

  if (!product) return notFound(); // ✅ ใส่ return

  return <ClientProductDetail product={product}/>;
}