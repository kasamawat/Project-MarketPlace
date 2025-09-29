"use client";
import { attrsToText } from "@/lib/helpers/productList";
import {
  buildStoreOrdersQS,
  SellerTabKey,
} from "@/lib/helpers/store-order-helper";
import {
  fulfillmentStatus,
  SellerOrderListItem,
} from "@/lib/helpers/store-order.dto";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

const SELLER_TABS = [
  { key: "pending", label: "Pending" }, // buyerStatus=paid & storeStatus in [PENDING, PACKED]
  { key: "awaiting_payment", label: "Wait Pay" }, // buyerStatus=pending_payment
  { key: "packed", label: "Packed" }, // buyerStatus=paid & storeStatus=SHIPPED
  { key: "shipped", label: "Shipped" }, // buyerStatus=paid & storeStatus=SHIPPED
  { key: "delivered", label: "Delivered" }, // buyerStatus=paid & storeStatus=DELIVERED
  { key: "canceled", label: "Canceled" }, // buyerStatus=canceled
  { key: "expired", label: "Expired" }, // buyerStatus=expired
  { key: "all", label: "All" }, // ทั้งหมด (optionally filter paid)
] as const;

function payBadge(s: SellerOrderListItem["buyerStatus"]) {
  const map: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-800",
    paying: "bg-amber-100 text-amber-800",
    processing: "bg-indigo-100 text-indigo-800",
    paid: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-700",
    expired: "bg-gray-200 text-gray-700",
  };
  return map[s] || "bg-gray-100 text-gray-700";
}

function fulfillBadge(s: fulfillmentStatus) {
  const map: Record<string, string> = {
    UNFULFILLED: "bg-amber-100 text-amber-800",
    PARTIALLY_FULFILLED: "bg-blue-100 text-blue-800",
    FULFILLED: "bg-indigo-100 text-indigo-800",
    CANCELED: "bg-green-100 text-green-800",
    RETURNED: "bg-red-100 text-red-700",
  };
  return map[s] || "bg-gray-100 text-gray-700";
}

export default function ClientStoreOrders() {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const [tab, setTab] = React.useState<SellerTabKey>("pending");
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<SellerOrderListItem[]>([]);
  const [total, setTotal] = React.useState(0);

  const load = React.useCallback(async () => {
    const qs = buildStoreOrdersQS(tab, page); // edit

    const res = await fetch(`${api}/store/orders?${qs}`, {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      items: SellerOrderListItem[];
      total: number;
    };

    console.log(data, "data");

    setItems(data.items);
    setTotal(data.total);
  }, [api, tab, page]);

  console.log(items, "items");

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full max-w-none px-6 space-y-4">
      <h1 className="text-2xl font-bold">Store Order</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {SELLER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setPage(1);
              setTab(t.key);
            }}
            className={`px-3 py-1 rounded-full border text-sm ${
              tab === t.key
                ? "bg-gray-700 text-white"
                : "hover:bg-gray-800 cursor-pointer"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow select-none">
        <table className="min-w-full text-left bg-gray-800 rounded-xl border border-gray-700">
          <thead className="bg-gray-600 text-white">
            <tr className="text-center">
              <th className="px-4 py-3 border border-gray-700">Order</th>
              <th className="px-4 py-3 border border-gray-700">Buyer</th>
              <th className="px-4 py-3 border border-gray-700">
                Items (ร้านนี้)
              </th>
              <th className="px-4 py-3 border border-gray-700">Store Total</th>
              <th className="px-4 py-3 border border-gray-700">Pay</th>
              <th className="px-4 py-3 border border-gray-700">Fulfillment</th>
              <th className="px-4 py-3 border border-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => {
              const more = o.itemsCount - o.itemsPreview.length;
              const preview = o.itemsPreview.slice(0, 3).map((st) => (
                <div key={st.name + st.qty} className="flex items-start mb-1">
                  <div>
                    <Image
                      src={st?.cover?.url || "/no-image.png"}
                      alt={st.name}
                      width={160}
                      height={224}
                      className="w-20 h-20 object-cover rounded-md shadow border border-gray-600 mx-auto"
                    />
                  </div>
                  <div className="flex flex-col ml-2">
                    <span className="font-semibold">{st.name}</span>
                    <span className="text-sm text-gray-400">
                      {attrsToText(st.attributes ?? {})}
                    </span>
                    <span className="mt-2">
                      {more > 0 ? ` และอีก ${more} รายการ` : ""}
                    </span>
                  </div>

                  <div className="ml-2 whitespace-nowrap">x {st.qty}</div>
                </div>
              ));

              const canFulfill = o.buyerStatus === "paid";
              const isShippedOrDone = ["FULFILLED"].includes(
                o?.fulfillment?.status ?? "UNFULFILLED"
              );

              return (
                <tr key={o.storeOrderId} className="border-gray-700">
                  <td className="px-4 py-3 border border-gray-700">
                    <div className="font-mono">#{o.storeOrderId}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-4 py-3 border border-gray-700">
                    <div className="max-w-[12rem] whitespace-normal break-words">
                      {o.buyer?.username || "-"}
                      <br />
                      <span className="text-xs text-gray-400">
                        {o.buyer?.email || ""}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 border border-gray-700">
                    <div className="max-w-[20rem] whitespace-normal break-words">
                      {preview}
                      {more > 0 ? ` และอีก ${more} รายการ` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3 border border-gray-700 text-center">
                    {o.itemsTotal?.toLocaleString()} {o.currency}
                  </td>

                  <td className="px-4 py-3 border border-gray-700 text-center">
                    <span
                      className={`px-2 py-1 rounded ${payBadge(o.buyerStatus)}`}
                    >
                      {o.buyerStatus === "pending_payment"
                        ? "Pending Pay"
                        : o.buyerStatus === "paid"
                        ? "Paid"
                        : o.buyerStatus === "expired"
                        ? "Expired"
                        : "Canceled"}
                    </span>
                  </td>

                  <td className="px-4 py-3 border border-gray-700 text-center">
                    <span
                      className={`px-2 py-1 rounded ${fulfillBadge(
                        o?.fulfillment?.status ?? "UNFULFILLED"
                      )}`}
                    >
                      {o?.fulfillment?.status ?? "UNFULFILLED"}
                    </span>
                  </td>

                  <td className="px-4 py-3 border border-gray-700">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        href={`/store/orders/${o.storeOrderId}`}
                        aria-label="ดูรายละเอียด (เฉพาะของร้าน)"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="icon icon-tabler icons-tabler-outline icon-tabler-file-description"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                          <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                          <path d="M9 17h6" />
                          <path d="M9 13h6" />
                        </svg>
                      </Link>

                      {canFulfill && !isShippedOrDone && (
                        <Link
                          href={`/store/orders/${o.storeOrderId}/fulfill`}
                          aria-label="แพ็ก / ใส่เลขพัสดุ"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-cube-send"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M16 12.5l-5 -3l5 -3l5 3v5.5l-5 3z" />
                            <path d="M11 9.5v5.5l5 3" />
                            <path d="M16 12.545l5 -3.03" />
                            <path d="M7 9h-5" />
                            <path d="M7 12h-3" />
                            <path d="M7 15h-1" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {!items.length && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2">
          <button
            className={`px-3 py-1 border rounded disabled:opacity-50 ${
              page === 1 ? "" : "cursor-pointer"
            }`}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ก่อนหน้า
          </button>
          <button
            className={`px-3 py-1 border rounded disabled:opacity-50 ${
              items.length < 10 ? "" : "cursor-pointer"
            }`}
            onClick={() => setPage((p) => p + 1)}
            disabled={items.length < 10}
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}
