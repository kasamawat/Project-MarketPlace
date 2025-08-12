import { notFound } from "next/navigation";
import Link from "next/link";
import ProductEditor from "@/components/store/products/ProductEditor";
import { ProductBase } from "@/types/product/base/product-base.types";
import { cookies } from "next/headers";

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { productId } = await params;

  const cookieStore = await cookies(); // ✅ ต้อง await
  // สร้าง header Cookie เอง (อย่าใช้ .toString() ตรง ๆ)
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  // เรียก API ฝั่ง Server Component (Next.js 13+)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
    {
      method: "GET",
      cache: "no-store",
      headers: { Cookie: cookieHeader },
    }
  );
  console.log(res, "res");

  if (!res.ok) {
    // ถ้าหาไม่เจอให้ไปหน้า 404
    return notFound();
  }

  const product: ProductBase = await res.json();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href="/store/products"
          className="text-sm text-indigo-500 hover:underline"
        >
          ← Back to Product List
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Edit Product #ID: {productId}</h2>

      <ProductEditor mode="edit" initialProduct={product} />
    </main>
  );
}
