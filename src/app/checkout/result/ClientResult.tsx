// app/checkout/result/ClientResult.tsx
"use client";

import { useOrderStream } from "@/app/hooks/useOrderStream";
import * as React from "react";

function CenterCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-2 text-center rounded-xl shadow-sm border border-gray-200/20 bg-white/5">
        {children}
      </div>
    </div>
  );
}

export default function ClientResult({ orderId }: { orderId: string }) {
  const { status, info, error } = useOrderStream(orderId);

  if (!orderId) return <CenterCard>ไม่พบ orderId</CenterCard>;
  if (error)
    return (
      <CenterCard>
        <div className="text-red-500">SSE: {error}</div>
      </CenterCard>
    );

  if (status === "paid") {
    return (
      <CenterCard>
        <h1 className="text-2xl font-bold text-green-600">ชำระเงินสำเร็จ</h1>
        <div>
          ยอด: {info?.paidAmount} {info?.paidCurrency}
        </div>
        <div>
          เวลา: {info?.paidAt ? new Date(info.paidAt).toLocaleString() : "-"}
        </div>
        <div>Charge ID: {info?.chargeId}</div>
        <a
          href="/orders"
          className="inline-block mt-4 px-4 py-2 rounded bg-black text-white"
        >
          ไปหน้าคำสั่งซื้อ
        </a>
      </CenterCard>
    );
  }

  if (status === "failed" || status === "canceled") {
    return (
      <CenterCard>
        <h1 className="text-2xl font-bold text-red-600">
          การชำระเงินไม่สำเร็จ
        </h1>
        <a
          href="/checkout"
          className="inline-block mt-4 px-4 py-2 rounded bg-black text-white"
        >
          ลองใหม่
        </a>
      </CenterCard>
    );
  }

  // awaiting_payment / paying / checking
  return (
    <CenterCard>
      <h1 className="text-xl font-semibold">กำลังตรวจสอบสถานะการชำระเงิน…</h1>
      <p className="text-sm text-gray-500">Order: {orderId}</p>
    </CenterCard>
  );
}
