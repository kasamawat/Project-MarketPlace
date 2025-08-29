// app/checkout/result/page.tsx
import ClientResult from "../ClientResult";

export default async function ResultPage({ params }: { params: { masterOrderId: string } }) {
  const { masterOrderId } = await params;
  return <ClientResult masterOrderId={masterOrderId} />;
}
