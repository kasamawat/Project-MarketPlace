// app/checkout/result/page.tsx
import ClientResult from "./ClientResult";

export default function ResultPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  return <ClientResult orderId={searchParams.orderId ?? ""} />;
}
