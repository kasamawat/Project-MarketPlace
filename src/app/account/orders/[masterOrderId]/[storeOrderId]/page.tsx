// app/account/orders/[orderId]/page.tsx
import { headers } from "next/headers";
import ClientOrderDetail from "./ClientOrderDetail";
import { BuyerOrderDetail } from "@/lib/helpers/orderDetail";

async function getOrder(masterOrderId: string ,storeOrderId: string): Promise<BuyerOrderDetail> {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await fetch(`${api}/orders/${masterOrderId}/${storeOrderId}/list`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "Failed to fetch");
    // throw new Error(msg);
    return {} as BuyerOrderDetail;
  }
  return res.json();
}

export default async function OrderDetailPage({
  params,
}: {
  params: { masterOrderId: string; storeOrderId: string };
}) {
  const { masterOrderId ,storeOrderId } = await params;
  const data = await getOrder(masterOrderId, storeOrderId);
  console.log(data,'data');
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ClientOrderDetail storeOrder={data} />
    </div>
  );
}
