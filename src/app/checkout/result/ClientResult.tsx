// app/checkout/result/ClientResult.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import { useOrderStream } from "@/app/hooks/useOrderStream";
import Link from "next/link";
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

export default function ClientResult({
  masterOrderId,
}: {
  masterOrderId: string;
}) {
  const { userStatus, info, error } = useOrderStream(masterOrderId);
  console.log(userStatus, "userStatus");

  const { clearCart, refetchCart } = useCart(); // เพิ่ม 2 ฟังก์ชั่นนี้ใน CartContext

  const handledPaidRef = React.useRef(false);

  React.useEffect(() => {
    if (userStatus !== "paid") return;
    if (handledPaidRef.current) return; // กันยิงซ้ำ
    handledPaidRef.current = true;

    // 1) เคลียร์ local ทันที
    clearCart({ localOnly: true });
    // 2) ซิงก์จาก BE (ครั้งเดียว)
    refetchCart();
  }, [userStatus, clearCart, refetchCart]);

  if (!masterOrderId) return <CenterCard>ไม่พบ orderId</CenterCard>;
  if (error)
    return (
      <CenterCard>
        <div className="text-red-500">SSE: {error}</div>
      </CenterCard>
    );

  if (userStatus === "paid") {
    return (
      <CenterCard>
        <h1 className="text-2xl font-bold text-green-600">ชำระเงินสำเร็จ</h1>
        <div>
          ยอด: {info?.paidAmount ?? info?.payment?.amount}{" "}
          {info?.paidCurrency ?? info?.payment?.currency}
        </div>
        <div>
          เวลา: {info?.paidAt ? new Date(info.paidAt).toLocaleString() : "-"}
        </div>
        <div>Charge ID: {info?.payment?.intentId}</div>
        <Link
          href="/account/orders"
          className="inline-block mt-4 px-4 py-2 rounded bg-black text-white"
        >
          ไปหน้าคำสั่งซื้อ
        </Link>
      </CenterCard>
    );
  }

  if (userStatus === "canceled") {
    return (
      <CenterCard>
        <h1 className="text-2xl font-bold text-red-600">
          การชำระเงินไม่สำเร็จ
        </h1>
        <Link
          href="/checkout"
          className="inline-block mt-4 px-4 py-2 rounded bg-black text-white"
        >
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

  // awaiting_payment / paying / checking
  return (
    <CenterCard>
      <h1 className="text-xl font-semibold">กำลังตรวจสอบสถานะการชำระเงิน…</h1>
      <p className="text-sm text-gray-500">Order: {masterOrderId}</p>
    </CenterCard>
  );
}
