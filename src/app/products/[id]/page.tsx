import notFound from "./not-found";
import ClientProductDetail from "./ClientProductDetail";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ProductBase } from "@/types/product/base/product-base.types";

type Props = {
  params: {
    id: string;
  };
};

async function fetchProduct(id: string): Promise<ProductBase> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/products/${id}`,
    {
      // ดึงสดทุกครั้ง
      cache: "no-store",
      // กัน edge case บางเคสของ Next
      next: { revalidate: 0 },
    }
  );

  if (res.status === 404) {
    notFound(); // ไปหน้า 404 อัตโนมัติ
  }
  if (!res.ok) {
    // โยน error ออกไปให้ React Error Boundary หรือ Next จัดการ
    throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Server Component
export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  console.log(id, "id");

  const product = await fetchProduct(id);

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
