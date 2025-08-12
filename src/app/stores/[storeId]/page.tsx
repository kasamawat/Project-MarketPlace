// /app/stores/[storeId]/page.tsx (ถ้าใช้ App Router ของ Next.js 13+)

import { notFound } from "next/navigation";
import ClientStoreDetail from "./ClientStoreDetail";
import { StorePubilc } from "@/types/store.types";
import { ProductBase } from "@/types/product/base/product-base.types";

type Props = {
  params: { storeId: string };
};

async function fetchStore(id: string): Promise<StorePubilc> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/store/${id}`,
    {
      method: "GET",
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

async function fetchProductsByStore(id: string): Promise<ProductBase[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/store/${id}/products`,
    {
      method: "GET",
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

export default async function StorePage({ params }: Props) {
  const { storeId } = await params;
  console.log(storeId, "storeId");

  const store = await fetchStore(storeId);

  if (!store) return notFound();

  // const products = await getProductsByStore(store._id);
  const products = await fetchProductsByStore(storeId);

  if (!products) return notFound();

  return <ClientStoreDetail store={store} product={products} />;
}
