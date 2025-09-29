"use client";

import React from "react";
import Link from "next/link";
import {
  AddressInfo,
  StoreOrderDetail,
} from "@/lib/helpers/order/seller/store-order-detail";
import { attrsToText } from "@/lib/helpers/productList";
import { StoreStatus } from "@/lib/helpers/order/order-base.types";
import Image from "next/image";

// --- Helpers ---
const fmtBaht = (n: number | undefined, currency = "THB"): string => {
  if (typeof n !== "number") return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
};

const fmtDateTime = (d?: string | Date | null): string => {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const badgeClassByStatus = (storeStatus: string): string => {
  const s = storeStatus?.toLowerCase();
  if (["paid", "delivered", "fulfilled"].includes(s))
    return "bg-green-100 text-green-800";
  if (["processing", "to_fulfill"].includes(s))
    return "bg-yellow-100 text-yellow-800";
  if (["shipped"].includes(s)) return "bg-blue-100 text-blue-800";
  if (["awaiting_payment", "pending_payment"].includes(s))
    return "bg-amber-100 text-amber-800";
  if (["canceled", "expired", "returned"].includes(s))
    return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

// แนะนำ: อนุญาตเข้า fulfill เฉพาะเมื่อร้านยังทำงานต่อได้ และผู้ซื้อจ่ายแล้ว
const canFulfill = (o?: StoreOrderDetail): boolean => {
  if (!o) return false;
  const store = (o.storeStatus ?? "").toUpperCase();
  const buyer = (o.buyerStatus ?? "").toLowerCase();

  // ถ้าอยากให้ DELIVERED/CANCELED เข้าไม่ได้ ให้ไม่ใส่ไว้ใน allowedStore
  const allowedStore = new Set<StoreOrderDetail["storeStatus"]>([
    "PENDING",
    "PACKED",
    "SHIPPED",
    // ถ้าต้องการให้เข้าหน้าดูเฉย ๆ แม้ส่งแล้ว ค่อยเพิ่ม "DELIVERED"
  ]);
  const allowedBuyer = new Set(["paid"]);

  return allowedBuyer.has(buyer) && allowedStore.has(store as StoreStatus);
};

// --- Main Page ---
export default function OrderDetailPage({
  storeOrderId,
}: {
  storeOrderId: string;
}): React.ReactElement {
  console.log(storeOrderId, "storeOrderId");

  const [data, setData] = React.useState<StoreOrderDetail | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  console.log(data, "data");

  React.useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/store/orders/${storeOrderId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as StoreOrderDetail;
        if (alive) setData(json);
      } catch (err) {
        if (alive) setError((err as Error)?.message ?? "Failed to load order");
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [storeOrderId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200 mb-4" />
        <div className="h-4 w-96 animate-pulse rounded bg-gray-200 mb-2" />
        <div className="h-4 w-80 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="mb-4 text-xl font-semibold">
          ไม่สามารถโหลดคำสั่งซื้อ
        </div>
        <div className="text-sm text-red-600">{error ?? "Unknown error"}</div>
        <Link
          href="/store/orders"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← กลับไป Orders
        </Link>
      </div>
    );
  }

  const allowFulfill = canFulfill(data);
  const fulfilled = data.fulfillment?.deliveredItems ?? 0;
  const fulfillStatus = data.fulfillment?.status ?? "UNFULFILLED";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Order #{data.storeOrderId}</h1>
            {data.buyerStatus && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${badgeClassByStatus(
                  data.buyerStatus
                )}`}
              >
                {data.buyerStatus}
              </span>
            )}
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${badgeClassByStatus(
                fulfillStatus
              )}`}
            >
              {fulfillStatus}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            สร้างเมื่อ {fmtDateTime(data.createdAt)} · อัปเดตล่าสุด{" "}
            {fmtDateTime(data.updatedAt)}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/store/orders"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-800"
          >
            ← กลับรายการ
          </Link>

          {allowFulfill ? (
            <Link
              href={`/store/orders/${data.storeOrderId}/fulfill`}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              ไปหน้า Fulfill
            </Link>
          ) : (
            // เวอร์ชัน disabled ที่ไม่กดได้ (แทนการใช้ Link + preventDefault)
            <span
              role="link"
              aria-disabled="true"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-gray-400 cursor-not-allowed select-none"
            >
              ไปหน้า Fulfill
            </span>
          )}
        </div>
      </div>

      {/* 3-column grid on desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Items */}
        <section className="xl:col-span-2">
          <Card>
            <CardHeader
              title="สินค้าในคำสั่งซื้อ"
              subtitle={`${data.itemsCount} รายการ`}
            />
            <div className="divide-y">
              {data.itemsPreview?.map((it) => (
                <div
                  key={`${data.storeOrderId}::${it.productId}::${it.skuId}`}
                  className="flex items-start gap-4 p-4"
                >
                  {/* image */}
                  {it.cover.url ? (
                    <Image
                      src={it?.cover?.url || "/no-image.png"}
                      alt={it.name}
                      width={160}
                      height={224}
                      className="h-25 w-25 rounded object-cover border"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {attrsToText(it.attributes)}
                    </div>
                    {it.fulfillStatus && (
                      <div className="mt-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded ${badgeClassByStatus(
                            it.fulfillStatus
                          )}`}
                        >
                          {it.fulfillStatus}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm">{fmtBaht(it.price)}</div>
                    <div className="text-xs text-gray-500">x {it.quantity}</div>
                    <div className="mt-1 font-medium">
                      {fmtBaht(it.subtotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 border-t">
              <div className="space-y-2 text-sm">
                {typeof data.discount === "number" && data.discount > 0 && (
                  <Row label="ส่วนลด" value={`- ${fmtBaht(data.discount)}`} />
                )}
                {typeof data.shippingFee === "number" && (
                  <Row label="ค่าจัดส่ง" value={fmtBaht(data.shippingFee)} />
                )}
                {typeof data.otherFee === "number" && data.otherFee > 0 && (
                  <Row label="ค่าอื่น ๆ" value={fmtBaht(data.otherFee)} />
                )}
                <Row label="ยอดรวม" value={fmtBaht(data.itemsTotal)} bold />
              </div>
            </div>
          </Card>
        </section>

        {/* Right: Info cards */}
        <section className="space-y-6">
          {/* Buyer */}
          <Card>
            <CardHeader title="ผู้ซื้อ" />
            <div className="p-4 space-y-1 text-sm">
              <Row label="ชื่อผู้ใช้" value={data.buyer?.username ?? "-"} />
              {!!data.buyer?.email && (
                <Row label="อีเมล" value={data.buyer.email} />
              )}
              {!!data.buyer?.phone && (
                <Row label="เบอร์" value={data.buyer.phone} />
              )}
              {data.masterOrderId && (
                <Row label="Master Order" value={data.masterOrderId} />
              )}
            </div>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader title="ที่อยู่จัดส่ง" />
            <div className="p-4 text-sm space-y-2">
              <AddressBlock a={data.shippingAddress} />
              {data.shippingAddress?.note && (
                <div className="text-xs text-gray-500">
                  หมายเหตุ: {data.shippingAddress.note}
                </div>
              )}
            </div>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader title="การชำระเงิน" />
            <div className="p-4 text-sm space-y-2">
              <Row label="ช่องทาง" value={data.payment?.method ?? "-"} />
              <Row
                label="สถานะ"
                value={data.payment?.status ?? data.buyerStatus ?? "-"}
              />
              <Row
                label="ยอดชำระ"
                value={fmtBaht(data.itemsTotal)} // data.payment?.amount ??
              />
              {!!data.payment?.fee && (
                <Row label="ค่าธรรมเนียม" value={fmtBaht(data.payment.fee)} />
              )}
              <Row
                label="ชำระเมื่อ"
                value={fmtDateTime(data.payment?.paidAt ?? null)}
              />
              {!!data.payment?.intentId && (
                <Row label="Reference" value={data.payment.intentId} />
              )}
            </div>
          </Card>

          {/* Fulfillment */}
          <Card>
            <CardHeader
              title="สถานะ Fulfillment"
              subtitle={`${fulfilled}/${
                data.fulfillment?.totalItems ?? data.itemsCount
              } delivered`}
            />
            <div className="p-4 space-y-3">
              <div>
                <Row
                  label="สถานะรวม"
                  value={data.fulfillment?.status ?? "UNFULFILLED"}
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500">
                  ไทม์ไลน์
                </div>
                <div className="space-y-2 max-h-52 overflow-auto pr-1">
                  {(data.fulfillment?.timeline ?? [])
                    .sort(
                      (a, b) =>
                        new Date(a.at).getTime() - new Date(b.at).getTime()
                    )
                    .map((t, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
                        <div className="flex-1 text-xs">
                          <div className="font-medium">{t.type}</div>
                          <div className="text-gray-500">
                            {fmtDateTime(t.at)}
                          </div>
                          {t.type && (
                            <div className="text-gray-600 mt-0.5">
                              {JSON.stringify(t.payload?.note)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

// --- Small UI atoms ---
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-gray-900 shadow-sm overflow-hidden">
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-4 py-3 border-b bg-gray-800">
      <div className="text-sm font-semibold">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value?: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-1">
      <div className="text-gray-500 w-[30%] shrink-0">{label}</div>
      <div
        className={`w-[70%] break-words whitespace-pre-wrap ${
          bold ? "font-semibold" : ""
        }`}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}

function AddressBlock({ a }: { a?: AddressInfo }) {
  if (!a) return <div className="text-gray-400">-</div>;
  return (
    <div>
      <div className="font-medium">{a.name ?? "-"}</div>
      <div className="text-sm text-gray-600">Tel. {a.phone ?? "-"}</div>
      <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
        {[a.line1, a.line2].filter(Boolean).join(", ")}
      </div>
      <div className="text-sm text-gray-600">
        {[a.subDistrict, a.district, a.province].filter(Boolean).join(", ")}
      </div>
      <div className="text-sm text-gray-600">
        {[a.postalCode, a.country].filter(Boolean).join(" ")}
      </div>
    </div>
  );
}
