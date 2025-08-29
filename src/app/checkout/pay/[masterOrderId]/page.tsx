// app/checkout/pay/[orderId]/page.tsx
import ClientPay from "../ClientPay";

export default async function PayPage({ params }: { params: { masterOrderId: string } }) {
  const { masterOrderId } = await params;
  return <ClientPay masterOrderId={masterOrderId} />;
}
