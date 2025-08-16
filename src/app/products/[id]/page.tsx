import notFound from "./not-found";
import ClientProductDetail from "./ClientProductDetail";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PublicProduct, SkuPublic } from "@/types/product/products.types";

type Props = {
  params: {
    id: string;
  };
};

async function fetchProduct(id: string): Promise<PublicProduct> {
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

async function fetchSkusByProduct(id: string): Promise<SkuPublic[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/products/${id}/skus`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(await res.text());

  return res.json();
}

// Server Component
export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  console.log(id, "id");

  const product: PublicProduct = await fetchProduct(id);

  const skus: SkuPublic[] = await fetchSkusByProduct(id);

  console.log(product, "product");
  console.log(skus, "skus");

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
      <ClientProductDetail product={product} skus={skus} />
    </div>
  );
}
