// /app/stores/[storeId]/page.tsx (ถ้าใช้ App Router ของ Next.js 13+)

import { notFound } from "next/navigation";
import { getStoreById } from "@/lib/stores";
import { getProductsByStore } from "@/lib/products";
import ClientStoreDetail from "./ClientStoreDetail";

type Props = {
  params: { storeId: string };
};

export default async function StorePage({ params }: Props) {
  const { storeId } = await params;
  const store = await getStoreById(storeId);
  if (!store) return notFound();
  console.log(store.id, "store.id");

  const products = await getProductsByStore(store.id);
  if (!products) return notFound();

  return <ClientStoreDetail store={store} product={products} />;
}
