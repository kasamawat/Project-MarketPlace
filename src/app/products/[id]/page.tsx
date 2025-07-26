import { getProduct } from "@/lib/products";
import notFound from "./not-found";
import ClientProductDetail from "./ClientProductDetail";
import Breadcrumbs from "@/components/Breadcrumbs";

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs
          paths={[
            { name: "HOME", href: "/", status: "link" },
            { name: "PRODUCTS", href: "/products", status: "link" },
            {
              name: product.name,
              href: "",
              status: "disabled",
            },
          ]}
        />
      </div>
      <ClientProductDetail product={product} />
    </div>
  );
}
