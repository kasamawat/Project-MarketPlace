"use client";
import { BuyerOrderListItem } from "@/lib/helpers/orderDetail";
import { attrsToText } from "@/lib/helpers/productList";
import Link from "next/link";
import * as React from "react";

const STATUS_TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending_payment", label: "รอชำระเงิน" },
  { key: "processing", label: "กำลังตรวจสอบ" },
  { key: "paid", label: "ชำระแล้ว" },
  { key: "expired", label: "หมดอายุ" },
  { key: "canceled", label: "ยกเลิก" },
] as const;

function statusBadge(s: BuyerOrderListItem["userStatus"]) {
  const map: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-800",
    paying: "bg-amber-100 text-amber-800",
    processing: "bg-indigo-100 text-indigo-800",
    paid: "bg-green-100 text-green-800",
    expired: "bg-gray-200 text-gray-700",
    canceled: "bg-red-100 text-red-700",
  };
  return map[s] || "bg-gray-100 text-gray-700";
}

export default function ClientOrders() {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const [tab, setTab] =
    React.useState<(typeof STATUS_TABS)[number]["key"]>("all");
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<BuyerOrderListItem[]>([]);
  const [total, setTotal] = React.useState(0);

  console.log(items, "items");

  const load = React.useCallback(async () => {
    const qs = new URLSearchParams();
    if (tab !== "all") qs.set("status", tab);
    qs.set("page", String(page));
    qs.set("limit", "10");
    const res = await fetch(`${api}/orders?${qs}`, { credentials: "include" });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as {
      items: BuyerOrderListItem[];
      total: number;
    };
    setItems(data.items);
    setTotal(data.total);
  }, [api, tab, page]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">คำสั่งซื้อของฉัน</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((t) => (
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

      {/* List Table New */}
      {items.map((it) => {
        const canPay = ["pending_payment", "paying", "processing"].includes(
          it.userStatus
        );
        const expired =
          it.userStatus === "expired" ||
          (it.reservationExpiresAt &&
            Date.parse(it.reservationExpiresAt) <= Date.now());

        return (
          <div
            key={it.masterOrderId}
            className="overflow-x-auto rounded-xl shadow select-none"
          >
            <div className="bg-gray-600 text-white px-4 py-3 border border-gray-700 text-sm flex items-center justify-between">
              <div>
                <div className="font-mono">OrderId #{it.masterOrderId}</div>
                <div className="text-xs text-gray-500">
                  CreateAt: {new Date(it.createdAt).toLocaleString()}
                </div>
              </div>
              {canPay && !expired && (
                <div className="flex">
                  <span>Pay: &nbsp;</span>
                  <Link
                    href={`/checkout/pay/${it.masterOrderId}`}
                    aria-label="ไปหน้าชำระเงิน"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 19h-6a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5" />
                      <path d="M3 10h18" />
                      <path d="M7 15h.01" />
                      <path d="M11 15h2" />
                      <path d="M16 19h6" />
                      <path d="M19 16l-3 3l3 3" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
            <table className="min-w-full text-left bg-gray-800 rounded-xl border border-gray-700">
              <thead className="bg-gray-600 text-white">
                <tr className="text-left">
                  <th className="px-4 py-3 border border-gray-700">
                    StoreName
                  </th>
                  <th className="px-4 py-3 border border-gray-700">
                    StoreOrder
                  </th>
                  <th className="px-4 py-3 border border-gray-700">List</th>
                  <th className="px-4 py-3 border border-gray-700">Total</th>
                  <th className="px-4 py-3 border border-gray-700">Status</th>
                  <th className="px-4 py-3 border border-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {it.storesSummary.map((store) => {
                  const preview = store.itemsPreview
                    .slice(0, 3)
                    .map((st) => `${st.name} x ${st.qty}`)
                    .join(", ");
                  const more = store.itemsCount - store.itemsPreview.length;
                  return (
                    <React.Fragment
                      key={`${it.masterOrderId}::${store.storeId}`}
                    >
                      <tr className="border-gray-700">
                        <td className="px-4 py-3 border border-gray-700 text-left">
                          <div className="font-mono">{store.storeName}</div>
                        </td>
                        <td className="px-4 py-3 border border-gray-700 text-left">
                          <div className="font-mono">#{store.storeOrderId}</div>
                        </td>
                        <td className="px-4 py-3 border border-gray-700 text-left">
                          <div className="max-w-[20rem] whitespace-normal break-words">
                            {preview}
                            {more > 0 ? ` และอีก ${more} รายการ` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-3 border border-gray-700 text-center">
                          {store.itemsTotal.toLocaleString()} {it.currency}
                        </td>
                        <td className="px-4 py-3 border border-gray-700 text-center">
                          <span
                            className={`px-2 py-1 rounded ${statusBadge(
                              it.userStatus
                            )}`}
                          >
                            {it.userStatus === "pending_payment"
                              ? "waitig pay"
                              : it.userStatus === "paying"
                              ? "paying"
                              : it.userStatus === "processing"
                              ? "checking"
                              : it.userStatus === "paid"
                              ? "paid"
                              : it.userStatus === "expired"
                              ? "expired"
                              : "cancles"}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-gray-700">
                          <div className="flex items-center justify-center gap-3">
                            <Link
                              href={`/account/orders/${it.masterOrderId}/${store.storeOrderId}`}
                              aria-label="ดูรายละเอียดคำสั่งซื้อ"
                              className="text-blue-600 hover:text-blue-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M11.5 21h-2.926a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304h11.339a2 2 0 0 1 1.977 2.304l-.117 .761" />
                                <path d="M9 11v-5a3 3 0 0 1 6 0v5" />
                                <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                <path d="M20.2 20.2l1.8 1.8" />
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* List Table */}
      {/* <div className="overflow-x-auto rounded-xl shadow select-none">
        <table className="min-w-full text-left bg-gray-800 rounded-xl border border-gray-700">
          <thead className="bg-gray-600 text-white">
            <tr className="text-center">
              <th className="px-4 py-3 border border-gray-700">Order</th>
              <th className="px-4 py-3 border border-gray-700">StoreOrder</th>
              <th className="px-4 py-3 border border-gray-700">List</th>
              <th className="px-4 py-3 border border-gray-700">Total</th>
              <th className="px-4 py-3 border border-gray-700">Status</th>
              <th className="px-4 py-3 border border-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => {
              const preview = o.itemsPreview
                .slice(0, 2)
                .map(
                  (it) => `${it.name} ${attrsToText(it.attributes)} × ${it.qty}`
                )
                .join(", ");
              const more = o.itemsCount - o.itemsPreview.length;
              const canPay = [
                "pending_payment",
                "paying",
                "processing",
              ].includes(o.userStatus);
              const expired =
                o.userStatus === "expired" ||
                (o.reservationExpiresAt &&
                  Date.parse(o.reservationExpiresAt) <= Date.now());

              return (
                <React.Fragment key={o.masterOrderId}>
                  <tr className="border-gray-700">
                    <td className="px-4 py-3 border border-gray-700 text-left">
                      <div className="font-mono">#{o.masterOrderId}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-700 text-left">
                      <div className="font-mono">#TESTTTTTTTTTT</div>
                      <div className="text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-700 text-left">
                      <div className="max-w-[20rem] whitespace-normal break-words">
                        {preview}
                        {more > 0 ? ` และอีก ${more} รายการ` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-700 text-center">
                      {o.itemsTotal.toLocaleString()} {o.currency}
                    </td>
                    <td className="px-4 py-3 border border-gray-700 text-center">
                      <span
                        className={`px-2 py-1 rounded ${statusBadge(
                          o.userStatus
                        )}`}
                      >
                        {o.userStatus === "pending_payment"
                          ? "waitig pay"
                          : o.userStatus === "paying"
                          ? "paying"
                          : o.userStatus === "processing"
                          ? "checking"
                          : o.userStatus === "paid"
                          ? "paid"
                          : o.userStatus === "expired"
                          ? "expired"
                          : "cancles"}
                      </span>
                    </td>
                    <td className="px-4 py-3 border border-gray-700">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/account/orders/${o.masterOrderId}`}
                          aria-label="ดูรายละเอียดคำสั่งซื้อ"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M11.5 21h-2.926a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304h11.339a2 2 0 0 1 1.977 2.304l-.117 .761" />
                            <path d="M9 11v-5a3 3 0 0 1 6 0v5" />
                            <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                            <path d="M20.2 20.2l1.8 1.8" />
                          </svg>
                        </Link>

                        {canPay && !expired && (
                          <Link
                            href={`/checkout/pay/${o.masterOrderId}`}
                            aria-label="ไปหน้าชำระเงิน"
                            className="text-blue-600 hover:text-blue-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M12 19h-6a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5" />
                              <path d="M3 10h18" />
                              <path d="M7 15h.01" />
                              <path d="M11 15h2" />
                              <path d="M16 19h6" />
                              <path d="M19 16l-3 3l3 3" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}

            {!items.length && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No Orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> */}

      {/* Pagination เบสิค */}
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
