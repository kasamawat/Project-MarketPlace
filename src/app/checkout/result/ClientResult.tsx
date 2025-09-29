// app/checkout/result/ClientResult.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import { useOrderStream, OrderEvent } from "@/app/hooks/useOrderStream";
import * as React from "react";
import Link from "next/link";

function CenterCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-2 text-center rounded-xl shadow-sm border border-gray-200/20 bg-white/5">
        {children}
      </div>
    </div>
  );
}

type MasterStatus =
  | "awaiting_payment"
  | "pending_payment"
  | "paying"
  | "paid"
  | "failed"
  | "canceled"
  | "expired";

const FINAL = new Set<MasterStatus>(["paid", "canceled", "expired"]);

export default function ClientResult({ masterOrderId }: { masterOrderId: string }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL!;
  const [userStatus, setUserStatus] = React.useState<MasterStatus>("pending_payment");
  const [info, setInfo] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { clearCart, refetchCart } = useCart();
  const handledPaidRef = React.useRef(false);

  // 1) โหลดสถานะครั้งแรก (ตอนรีเฟรชเพจ)
  const fetchInitial = React.useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/orders/${masterOrderId}/result`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUserStatus(data.buyerStatus as MasterStatus);
      setInfo({
        masterOrderId: data.masterOrderId,
        buyerStatus: data.buyerStatus,
        createdAt: data.createdAt,
        currency: data.currency,
        payment: data.payment,
        paidAt: data.paidAt,
        paidAmount: data.paidAmount,
        paidCurrency: data.paidCurrency,
        paymentIntentId: data.payment?.intentId,
        stores: data.stores,
      });
    } catch (e) {
      setError((e as Error)?.message || "โหลดคำสั่งซื้อไม่สำเร็จ");
    }
  }, [apiBase, masterOrderId]);

  React.useEffect(() => {
    if (!masterOrderId) return;
    fetchInitial();
  }, [masterOrderId, fetchInitial]);

  // 2) เปิด SSE แบบเดียวกับ useNotificationsStream
  useOrderStream(masterOrderId, (evt: OrderEvent) => {
    if (!evt?.status) return;
    setUserStatus(evt.status as MasterStatus);
    setInfo((prev: any) => ({ ...(prev ?? { masterOrderId }), ...evt }));
  });

  // 3) ล้างตะกร้าเมื่อจ่ายสำเร็จ (กันยิงซ้ำ)
  React.useEffect(() => {
    if (userStatus !== "paid") return;
    if (handledPaidRef.current) return;
    handledPaidRef.current = true;
    clearCart({ localOnly: true });
    refetchCart();
  }, [userStatus, clearCart, refetchCart]);

  if (!masterOrderId) return <CenterCard>ไม่พบ orderId</CenterCard>;
  if (error) return <CenterCard><div className="text-red-500">SSE: {error}</div></CenterCard>;

  if (userStatus === "paid") {
    return (
      <CenterCard>
        <h1 className="text-2xl font-bold text-green-600">ชำระเงินสำเร็จ</h1>
        <div>ยอด: {info?.paidAmount ?? info?.payment?.amount} {info?.paidCurrency ?? info?.payment?.currency}</div>
        <div>เวลา: {info?.paidAt ? new Date(info.paidAt).toLocaleString() : "-"}</div>
        <div>Charge ID: {info?.payment?.intentId}</div>
        <Link href="/account/orders" className="inline-block mt-4 px-4 py-2 rounded bg-black text-white">
          ไปหน้าคำสั่งซื้อ
        </Link>
      </CenterCard>
    );
  }

  if (userStatus === "canceled") {
    return (
      <CenterCard>
        <h1 className="text-2xl font-bold text-red-600">การชำระเงินไม่สำเร็จ</h1>
        <Link href="/checkout" className="inline-block mt-4 px-4 py-2 rounded bg-black text-white">
          ลองใหม่
        </Link>
      </CenterCard>
    );
  }

  if (userStatus === "expired") {
    return (
      <CenterCard>
        <h1 className="text-xl font-semibold text-red-600">หมดเวลาชำระเงิน</h1>
        <p className="text-sm text-gray-500">Order: {masterOrderId}</p>
      </CenterCard>
    );
  }

  return (
    <CenterCard>
      <h1 className="text-xl font-semibold">กำลังตรวจสอบสถานะการชำระเงิน…</h1>
      <p className="text-sm text-gray-500">Order: {masterOrderId}</p>
    </CenterCard>
  );
}
