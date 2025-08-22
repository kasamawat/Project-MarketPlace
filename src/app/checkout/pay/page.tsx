// app/checkout/pay/page.tsx
import ClientPay from "./ClientPay";

export default function PayPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId ?? "";
  return <ClientPay orderId={orderId} />;
}
