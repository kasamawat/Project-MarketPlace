import { notFound } from "next/navigation";
import Link from "next/link";
import ProductEditor from "@/components/store/products/ProductEditor";
import { cookies } from "next/headers";
import { ProductDetailResponse, ProductEditorState, SkuRow } from "@/types/product/products.types";

// Next App Router: params ไม่ใช่ Promise
interface EditProductPageProps {
  params: { productId: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params;

  // สร้าง Cookie header สำหรับ fetch ฝั่งเซิร์ฟเวอร์
  const cookieStore = await cookies(); // ไม่ต้อง await
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  // ดึง product + skus พร้อมกัน
  const [resProduct, resSkus] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
      method: "GET",
      cache: "no-store",
      headers: { Cookie: cookieHeader },
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/skus`, {
      method: "GET",
      cache: "no-store",
      headers: { Cookie: cookieHeader },
    }),
  ]);

  // จัดการ error เฉพาะกรณีสำคัญ
  if (resProduct.status === 404) return notFound();
  if (resProduct.status === 401 || resProduct.status === 403) {
    // ถ้ามีหน้า login สำหรับเจ้าของร้าน:
    // return redirect("/auth/login");
    // หรือถ้าจะพากลับ dashboard:
    // return redirect("/store/dashboard");
  }
  if (!resProduct.ok) {
    throw new Error(`Failed to load product: ${await resProduct.text()}`);
  }
  // SKUs ถ้าพัง ให้ถือว่า 0 (ยังแก้สินค้าส่วนอื่นได้)
  let skus: SkuRow[] = [];
  if (resSkus.ok) {
    skus = await resSkus.json();
  }

  const product: ProductDetailResponse = await resProduct.json();

  // map → ProductEditorState (ให้ ProductEditor ใช้ต่อ)
  const initialProduct: ProductEditorState = {
    _id: product._id,
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    type: product.type,
    defaultPrice: product.defaultPrice,
    status: product.status,
    skus: (skus ?? []).map((s) => ({
      _id: s._id,
      skuCode: s.skuCode,
      attributes: s.attributes ?? {},
      price: s.price,
      image: s.image,
      purchasable: s.purchasable ?? true,
    })),
  };
  
  console.log(initialProduct,'initialProduct');
  

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/store/products" className="text-sm text-indigo-500 hover:underline">
          ← Back to Product List
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Edit Product #ID: {productId}</h2>

      <ProductEditor mode="edit" initialProduct={initialProduct} />
    </main>
  );
}

// (ทางเลือก) บังคับ dynamic เพื่อกันแคชระดับไฟล์
export const dynamic = "force-dynamic";
