"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BuyerOrderDetail } from "@/lib/helpers/orderDetail";

type Props = { storeOrder: BuyerOrderDetail };

// ถ้ามี useCountdown อยู่แล้ว ให้ import ของคุณแทน
function useCountdown(iso?: string) {
  const [ms, setMs] = React.useState(0);
  React.useEffect(() => {
    if (!iso) return setMs(0);
    const t = () => setMs(new Date(iso).getTime() - Date.now());
    t();
    const id = setInterval(t, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return Math.max(0, ms);
}
function fmtMMSS(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function StatusBadge({ status }: { status: BuyerOrderDetail["userStatus"] }) {
  const map: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-800",
    paying: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    canceled: "bg-gray-200 text-gray-800",
    expired: "bg-gray-200 text-gray-800",
  };
  return (
    <span
      className={`text-md inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
        map[status] || "bg-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

export default function ClientOrderDetail({ storeOrder }: Props) {
  const router = useRouter();
  const leftMs = useCountdown(storeOrder.reservationExpiresAt);
  const isExpired = storeOrder.userStatus === "expired" || leftMs <= 0;
  const canPay =
    ["pending_payment", "paying", "processing"].includes(
      storeOrder.userStatus
    ) && !isExpired;

  const storePrice = storeOrder.stores[0].pricing ?? {
    itemsTotal: storeOrder.stores[0].items.reduce((acc, it) => {
      return acc + it.quantity;
    }, 0),
    shippingFee: 0,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal: storeOrder.stores[0].items.reduce((acc, it) => {
      return acc + it.subtotal;
    }, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            คำสั่งซื้อ #{storeOrder.stores[0].storeOrderId}
          </h1>
          <div className="text-sm text-gray-500">
            สร้างเมื่อ {new Date(storeOrder.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="mt-auto mb-auto">
          <StatusBadge status={storeOrder.userStatus} />
          {/* <div className="text-sm text-gray-500">
            ชำระเงินเมื่อ {new Date(storeOrder.paidAt).toLocaleString()}
          </div> */}
        </div>
      </div>

      {/* Info bar */}
      <div className="rounded-lg border border-gray-700 p-4 flex items-center justify-between bg-gray-900">
        <div className="text-sm text-gray-300">
          รวมทั้งหมด:{" "}
          <span className="font-semibold text-white">
            {storePrice.grandTotal.toLocaleString()} {storeOrder.currency}
          </span>
        </div>
        <div className="text-sm">
          {storeOrder.reservationExpiresAt &&
          !["paid", "failed", "canceled", "expired"].includes(
            storeOrder.userStatus
          ) ? (
            isExpired ? (
              <span className="text-red-500">การจองหมดอายุแล้ว</span>
            ) : (
              <span className="text-gray-300">
                การจองสต็อกหมดอายุใน ~{" "}
                <span className="font-mono text-white">{fmtMMSS(leftMs)}</span>{" "}
                นาที
              </span>
            )
          ) : null}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items */}
        <div className="lg:col-span-2 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-900 font-semibold">
            รายการสินค้า
          </div>
          <div className="divide-y divide-gray-800">
            {storeOrder.stores[0].items.map((it, idx) => (
              <div
                key={`${it.productId}:${it.skuId}:${idx}`}
                className="p-4 flex items-center gap-4"
              >
                {it.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.productImage}
                    alt={it.productName}
                    className="w-16 h-16 object-cover rounded-md border border-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 grid place-items-center rounded-md border border-dashed border-gray-700 text-xs text-gray-500">
                    No image
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{it.productName}</div>
                  {it.attributes && Object.keys(it.attributes).length > 0 && (
                    <div className="text-xs text-gray-400 truncate max-w-[42ch]">
                      {Object.entries(it.attributes)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">SKU: {it.skuId}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    ฿ {it.unitPrice?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">x {it.quantity}</div>
                  <div className="font-semibold">
                    ฿ {it.subtotal.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary / Payment / Shipping */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-900 font-semibold">
              สรุปยอด
            </div>
            <div className="p-4 space-y-2 text-sm">
              <Row
                label="ค่าสินค้า"
                value={`฿ ${storePrice.itemsTotal.toLocaleString()}`}
              />
              <Row
                label="ค่าส่ง"
                value={`฿ ${storeOrder?.pricing?.shippingFee.toLocaleString()}`}
              />
              {(storeOrder?.pricing?.discountTotal ?? 0) > 0 && (
                <Row
                  label="ส่วนลด"
                  value={`- ฿ ${storeOrder?.pricing?.discountTotal.toLocaleString()}`}
                />
              )}
              {(storeOrder?.pricing?.taxTotal ?? 0) > 0 && (
                <Row
                  label="ภาษี"
                  value={`฿ ${storeOrder?.pricing?.taxTotal.toLocaleString()}`}
                />
              )}
              <div className="pt-2 mt-2 border-t border-gray-800 flex items-center justify-between">
                <div className="font-semibold">ยอดสุทธิ</div>
                <div className="font-bold text-white">
                  ฿ {storePrice.grandTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-900 font-semibold">
              การชำระเงิน
            </div>
            <div className="p-4 text-sm space-y-2">
              <Row
                label="ผู้ให้บริการ"
                value={storeOrder.payment?.provider ?? "-"}
              />
              <Row
                label="สถานะชำระ"
                value={storeOrder.payment?.status ?? "-"}
              />
              {storeOrder.payment?.intentId && (
                <Row
                  label="เลขที่การชำระ"
                  value={storeOrder.payment.intentId}
                />
              )}
              {storeOrder.payment?.receiptEmail && (
                <Row
                  label="อีเมลใบเสร็จ"
                  value={storeOrder.payment.receiptEmail}
                />
              )}

              {canPay ? (
                <Link
                  href={`/checkout/pay/${storeOrder.masterOrderId}`}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
                >
                  ชำระเงินตอนนี้
                </Link>
              ) : storeOrder.userStatus === "paid" ? (
                <Link
                  href={`/account/orders/${storeOrder.masterOrderId}/invoice`}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-gray-600 px-4 py-2 text-gray-100 hover:bg-gray-800"
                >
                  ดู/พิมพ์ใบเสร็จ
                </Link>
              ) : null}
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-900 font-semibold">
              การจัดส่ง
            </div>
            <div className="p-4 text-sm space-y-1">
              <div>วิธีส่ง: {storeOrder.stores[0].shipping?.method ?? "-"}</div>
              <div className="text-gray-300">
                {[
                  storeOrder.stores[0].shipping?.address?.line1,
                  storeOrder.stores[0].shipping?.address?.line2,
                  storeOrder.stores[0].shipping?.address?.district,
                  storeOrder.stores[0].shipping?.address?.province,
                  storeOrder.stores[0].shipping?.address?.postalCode,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </div>
              <div className="text-gray-400">
                ผู้รับ: {storeOrder.stores[0].shipping?.contact?.name ?? "-"} /{" "}
                {storeOrder.stores[0].shipping?.contact?.phone ?? "-"}
              </div>
            </div>
          </div>

          {/* (Option) Timeline */}
          {storeOrder.stores[0].timeline &&
            storeOrder.stores[0].timeline.length > 0 && (
              <div className="rounded-lg border border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700 bg-gray-900 font-semibold">
                  ไทม์ไลน์
                </div>
                <ul className="p-4 space-y-2 text-sm">
                  {storeOrder.stores[0].timeline.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-gray-500" />
                      <div>
                        <div className="font-medium">{t.type}</div>
                        <div className="text-gray-400">
                          {new Date(t.at).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/account/orders"
          className="px-4 py-2 rounded-md border border-gray-600 text-gray-100 hover:bg-gray-800"
        >
          กลับไปหน้ารายการคำสั่งซื้อ
        </Link>
        {canPay && (
          <button
            onClick={() =>
              router.push(`/checkout/pay/${storeOrder.masterOrderId}`)
            }
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
          >
            ชำระเงินตอนนี้
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-gray-400">{label}</div>
      <div className="text-gray-100 truncate max-w-[60%] text-right">
        {value ?? "-"}
      </div>
    </div>
  );
}
