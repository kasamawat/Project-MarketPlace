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
  masterOrderId: string;
  status:
    | "pending_payment"
    | "paying"
    | "processing"
    | "paid"
    | "failed"
    | "expired"
    | "canceled";
  itemsTotal: number;
  currency: string;
  reservationExpiresAt?: string;
};

// ---------- helpers ----------
function safeLeftMs(iso?: string, nowMs?: number) {
  if (!iso) return 0;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  const base = typeof nowMs === "number" ? nowMs : Date.now();
  return Math.max(0, t - base);
}

function formatMMSS(ms: number) {
  if (!Number.isFinite(ms)) return { mm: "-", ss: "--" };
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60);
  const ss = String(totalSec % 60).padStart(2, "0");
  return { mm, ss };
}
export default function ClientPay({
  masterOrderId,
}: {
  masterOrderId: string;
}) {
  // ---------- state ----------
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<OrderView | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string>();
  const [err, setErr] = React.useState<string | null>(null);
  // ⏱️ เพิ่มตัวจับเวลา
  const [nowMs, setNowMs] = React.useState<number>(() => Date.now());
  // ใช้ countdown ที่ปลอดภัยต่อค่าเริ่มต้น/NaN
  const leftMs = safeLeftMs(order?.reservationExpiresAt, nowMs);
  const { mm, ss } = formatMMSS(leftMs);
  console.log(leftMs > 0,'leftMs');
  
  // สถานะรวม
  const endedStatuses = ["paid", "failed", "canceled", "expired"];
  // const ended = !!order && endedStatuses.includes(order.status);
  const expiredByStatus = order?.status === "expired";
  const expiredByTime = Number.isFinite(leftMs) && leftMs <= 0;
  const isExpired = expiredByStatus || expiredByTime;
  
  // พร้อมจ่ายหรือไม่
  const isPayable =
    !!order &&
    ["pending_payment", "paying", "processing"].includes(order.status) &&
    !isExpired;

  const api = process.env.NEXT_PUBLIC_API_URL!;

  // A) โหลดสถานะออเดอร์
  // ---------- fetch order ----------
  const fetchOrder = React.useCallback(async () => {
    const res = await fetch(`${api}/orders/${masterOrderId}/pay-meta`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      // ให้ error สื่อความชัดเจน (410 = หมดอายุ)
      const text = await res.text();
      throw new Error(text || `โหลดออเดอร์ไม่สำเร็จ (${res.status})`);
    }
    const data = (await res.json()) as OrderView;
    setOrder(data);
    return data;
  }, [api, masterOrderId]);

  // B) ensure/create intent (automatic)
  // ---------- ensure/create intent ----------
  const ensureIntent = React.useCallback(async () => {
    const res = await fetch(`${api}/payments/ensure-intent`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterOrderId, method: "card" }),
    });
    // ✅ ต้องเช็ก ok — ถ้าหมดอายุ/ไม่พร้อมชำระ ให้ throw เพื่อไม่ setClientSecret
    if (!res.ok) throw new Error(await res.text());
    const out = (await res.json()) as {
      clientSecret: string;
      intentId: string;
    };
    setClientSecret(out.clientSecret);
  }, [api, masterOrderId]);

  // ---------- bootstrap flow ----------
  React.useEffect(() => {
    (async () => {
      try {
        const o = await fetchOrder();

        // ตัดสินใจจาก server ก่อนเสมอ
        const serverExpired =
          o.status === "expired" ||
          (!!o.reservationExpiresAt &&
            Date.parse(o.reservationExpiresAt) <= Date.now());
        console.log(serverExpired, "serverExpired");

        if (!endedStatuses.includes(o.status) && !serverExpired) {
          await ensureIntent();
        }
      } catch (e) {
        setErr((e as Error)?.message ?? "ไม่สามารถเปิดหน้าชำระเงินได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchOrder, ensureIntent]);

  // ⏱️ tick ทุก 1s เฉพาะตอนยังจ่ายได้ และมี expiry
  React.useEffect(() => {
    if (!order?.reservationExpiresAt) return;
    if (!isPayable) return;

    const id = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, [order?.reservationExpiresAt, isPayable]);

  // ---------- clear secret เมื่อหมดอายุจริง ๆ ----------
  React.useEffect(() => {
    if (loading) return; // ห้ามเคลียร์ตอนยังโหลดอยู่
    if (!isPayable && clientSecret) {
      setClientSecret(undefined); // หมดอายุ/ไม่พร้อมจ่าย → ซ่อน Elements
    }
  }, [loading, isPayable, clientSecret]);

  if (!masterOrderId) return <Center>ไม่พบ orderId</Center>;
  if (err) return <Center className="text-red-500">{err}</Center>;
  if (!order) return <Center>กำลังโหลด...</Center>;

  if (order.status === "paid") {
    return <Center className="text-green-600">ชำระเงินสำเร็จแล้ว</Center>;
  }
  if (order.status === "failed" || order.status === "canceled") {
    return <Center className="text-red-600">ออเดอร์นี้ไม่พร้อมชำระ</Center>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">ชำระเงินออเดอร์ #{masterOrderId}</h1>
      <div className="text-sm text-gray-500 min-h-[1.5rem]">
        {loading ? (
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        ) : order && leftMs > 0 ? (
          <span className="ml-2">
            ยอด {order.itemsTotal} {order.currency} จองสต็อกหมดอายุใน ~{mm}:{ss}{" "}
            นาที
          </span>
        ) : order ? (
          <span className="ml-2 text-red-600">การจองหมดอายุแล้ว</span>
        ) : (
          <span className="ml-2 text-red-600">ไม่พบออเดอร์</span>
        )}
      </div>

      {/* ---------- render (เช็กลำดับให้ชัด) ---------- */}
      {loading ? (
        <Center>กำลังเตรียมการชำระเงิน…</Center>
      ) : err ? (
        <Center className="text-red-600">{err}</Center>
      ) : !isPayable ? (
        <></> // ไม่พร้อมชำระ (หมดอายุ/จ่ายแล้ว/ยกเลิก)
      ) : clientSecret ? (
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
          <ConfirmForm orderId={masterOrderId} clientSecret={clientSecret} />
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
        }/checkout/result/${encodeURIComponent(orderId)}`,
      },
    });

    if (error) setMsg(error.message ?? "Payment failed");
    else {
      setMsg("กำลังตรวจสอบสถานะการชำระเงิน…");
      router.push(`/checkout/result/${encodeURIComponent(orderId)}`);
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
