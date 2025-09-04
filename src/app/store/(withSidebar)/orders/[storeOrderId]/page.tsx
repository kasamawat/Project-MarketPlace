import OrderDetailPage from "./ClientOrderDetail";

export default async function orderDetailPage({
  params,
}: {
  params: { storeOrderId: string };
}) {
  const { storeOrderId } = await params;
  return <OrderDetailPage storeOrderId={storeOrderId} />;
}
