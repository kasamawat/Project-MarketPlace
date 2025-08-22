// app/checkout/pay/ClientPay.tsx
"use client";
import * as React from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { useRouter } from "next/navigation";

type OrderView = {
  orderId: string;
  status:
    | "pending_payment"
    | "paying"
    | "processing"
    | "paid"
    | "failed"
    | "canceled";
  itemsTotal: number;
  currency: string;
  reservationExpiresAt?: string;
};

export default function ClientPay({ orderId }: { orderId: string }) {
  const [order, setOrder] = React.useState<OrderView | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string>();
  const [err, setErr] = React.useState<string | null>(null);

  const api = process.env.NEXT_PUBLIC_API_URL!;

  // A) โหลดสถานะออเดอร์
  const fetchOrder = React.useCallback(async () => {
    const res = await fetch(`${api}/orders/${orderId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as OrderView;
    setOrder(data);
    return data;
  }, [api, orderId]);

  // B) ensure/create intent (automatic)
  const ensureIntent = React.useCallback(async () => {
    const res = await fetch(`${api}/payments/ensure-intent`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, method: "automatic" }),
    });
    if (!res.ok) throw new Error(await res.text());
    const out = (await res.json()) as {
      clientSecret: string;
      intentId: string;
    };
    setClientSecret(out.clientSecret);
  }, [api, orderId]);

  React.useEffect(() => {
    (async () => {
      try {
        const o = await fetchOrder();
        if (
          o.status === "paid" ||
          o.status === "failed" ||
          o.status === "canceled"
        ) {
          return; // ไม่ต้องชำระแล้ว
        }
        await ensureIntent();
      } catch (e) {
        setErr((e as Error)?.message ?? "ไม่สามารถเปิดหน้าชำระเงินได้");
      }
    })();
  }, [fetchOrder, ensureIntent]);

  if (!orderId) return <Center>ไม่พบ orderId</Center>;
  if (err) return <Center className="text-red-500">{err}</Center>;
  if (!order) return <Center>กำลังโหลด...</Center>;

  if (order.status === "paid") {
    return <Center className="text-green-600">ชำระเงินสำเร็จแล้ว</Center>;
  }
  if (order.status === "failed" || order.status === "canceled") {
    return <Center className="text-red-600">ออเดอร์นี้ไม่พร้อมชำระ</Center>;
  }

  // countdown แสดงเวลาเหลือ (optional)
  const remainMs = order.reservationExpiresAt
    ? new Date(order.reservationExpiresAt).getTime() - Date.now()
    : 0;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">ชำระเงินออเดอร์ #{order.orderId}</h1>
      <div className="text-sm text-gray-500">
        ยอด {order.itemsTotal} {order.currency}{" "}
        {remainMs > 0 && (
          <span className="ml-2">
            จองสต็อกหมดอายุใน ~{Math.ceil(remainMs / 60000)} นาที
          </span>
        )}
      </div>

      {clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            locale: "th",
            appearance: {
              theme: "stripe",
              variables: { fontFamily: "inherit" },
            },
          }}
        >
          <ConfirmForm orderId={order.orderId} clientSecret={clientSecret} />
        </Elements>
      ) : (
        <Center>กำลังเตรียมการชำระเงิน…</Center>
      )}
    </div>
  );
}

function ConfirmForm({
  orderId,
  clientSecret,
}: {
  orderId: string;
  clientSecret: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setMsg(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMsg(submitError.message ?? "กรุณาตรวจสอบข้อมูล");
      setSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: "if_required",
      confirmParams: {
        return_url: `${
          window.location.origin
        }/checkout/result?orderId=${encodeURIComponent(orderId)}`,
      },
    });

    if (error) setMsg(error.message ?? "Payment failed");
    else {
      setMsg("กำลังตรวจสอบสถานะการชำระเงิน…");
      router.push(`/checkout/result?orderId=${encodeURIComponent(orderId)}`);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={onConfirm} className="space-y-4">
      <PaymentElement />
      {msg && <div className="text-sm text-yellow-600">{msg}</div>}
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full px-4 py-2 rounded bg-gray-800 hover:bg-gray-900 text-white disabled:opacity-50 cursor-pointer"
      >
        {submitting ? "Processing..." : "ยืนยันการชำระเงิน"}
      </button>
      <p className="text-xs text-gray-500">
        * สถานะสุดท้ายยืนยันจาก Webhook ฝั่งเซิร์ฟเวอร์
      </p>
    </form>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Center({ children, className }: any) {
  return (
    <div
      className={`min-h-[50vh] grid place-items-center text-center ${
        className || ""
      }`}
    >
      <div>{children}</div>
    </div>
  );
}
