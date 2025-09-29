// app/components/NotificationBell.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useNotificationsStream } from "@/app/hooks/useNotificationsStream";

type NotiDoc = {
  _id: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
};

type Props = {
  initialItems?: NotiDoc[];
  initialUnread?: number;
};

const API = process.env.NEXT_PUBLIC_API_URL!;

async function fetchNotifications(
  status?: string,
  limit = 12
): Promise<NotiDoc[]> {
  const q = new URLSearchParams({
    limit: String(limit),
    ...(status ? { status } : {}),
  });
  const res = await fetch(`${API}/user/notifications?${q.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json(); // ❗ อ่านครั้งเดียวพอ
  return data.items ?? data; // รองรับทั้ง {items} หรือ array
}

async function markAsRead(id: string) {
  const res = await fetch(`${API}/user/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "include",
  });
  return res.ok;
}

async function markAllRead() {
  const res = await fetch(`${API}/user/notifications/mark-all-read`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

function useClickOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

function fmtTimeAgo(iso: string): string {
  try {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const d = new Date(iso).getTime();
    const diffSec = Math.round((d - Date.now()) / 1000);
    const abs = Math.abs(diffSec);
    if (abs < 60) return rtf.format(Math.trunc(diffSec), "second");
    const diffMin = Math.trunc(diffSec / 60);
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
    const diffHr = Math.trunc(diffMin / 60);
    if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
    const diffDay = Math.trunc(diffHr / 24);
    return rtf.format(diffDay, "day");
  } catch {
    return new Date(iso).toLocaleString();
  }
}

function hrefNotiBadge(item: NotiDoc) {
  const map: Record<string, string> = {
    ORDER_CREATED: `/checkout/pay/${encodeURIComponent(
      String(item.data?.masterOrderId)
    )}`,
    ORDER_PAID: `/account/orders/`, //${encodeURIComponent(String(item.data?.masterOrderId))}/${encodeURIComponent(String(item.data?.storeOrderId))}
    ORDER_SHIPPED: `/account/orders/${encodeURIComponent(
      String(item.data?.masterOrderId)
    )}/${encodeURIComponent(String(item.data?.storeOrderId))}`,
    ORDER_DELIVERED: `/account/orders/${encodeURIComponent(
      String(item.data?.masterOrderId)
    )}/${encodeURIComponent(String(item.data?.storeOrderId))}`,
    ORDER_PAYMENT_EXPIRED: `/account/orders/${encodeURIComponent(
      String(item.data?.masterOrderId)
    )}/${encodeURIComponent(String(item.data?.storeOrderId))}`,
    STORE_ORDER_PAID: `/store/orders/${encodeURIComponent(
      String(item.data?.storeOrderId)
    )}`,
  };

  return map[item.type];
}

export default function NotificationBell({
  initialItems = [],
  initialUnread = 0,
}: Props): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<NotiDoc[]>(initialItems);
  const unreadCount = React.useMemo(
    () => items.filter((i) => i.status === "UNREAD").length,
    [items]
  );
  // const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // const unreadCount =
  //   items.filter((i) => i.status === "UNREAD").length || initialUnread;

  console.log(items, "items");

  // กันซ้ำเมื่อรีเฟรช + SSE ชน
  const addItem = React.useCallback((doc: NotiDoc) => {
    setItems((prev) => {
      const next = prev.some((x) => x._id === doc._id)
        ? prev
        : [doc, ...prev].slice(0, 20);
      return next;
    });
  }, []);

  // live SSE
  useNotificationsStream(async (evt: any) => {
    if (!evt?.type) return;
    if (evt.type === "notification") {
      addItem(evt.payload as NotiDoc);
      return;
    }
    // เผื่อ BE ยังส่ง ORDER_* แบบย่ออยู่ → reload UNREAD 1 ครั้ง
    if (
      [
        "ORDER_CREATED",
        "ORDER_PAID",
        "ORDER_SHIPPED",
        "ORDER_DELIVERED",
      ].includes(evt.type)
    ) {
      const fresh = await fetchNotifications("UNREAD", 12);
      setItems((prev) => {
        const ids = new Set(fresh.map((x) => x._id));
        const keepRead = prev.filter((x) => x.status !== "UNREAD");
        return [...fresh, ...keepRead.filter((x) => !ids.has(x._id))].slice(
          0,
          20
        );
      });
    }
  });

  const toggle = React.useCallback(() => setOpen((s) => !s), []);
  const close = React.useCallback(() => setOpen(false), []);
  const panelRef = useClickOutside<HTMLDivElement>(close);

  const onMarkOne = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      // optimistic
      setItems((prev) =>
        prev.map((x) => (x._id === id ? { ...x, status: "READ" } : x))
      );
      const ok = await markAsRead(id);
      if (!ok) {
        // rollback หากล้มเหลว
        setItems((prev) =>
          prev.map((x) => (x._id === id ? { ...x, status: "UNREAD" } : x))
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const onMarkAll = async () => {
    if (busy || unreadCount === 0) return;
    setBusy(true);
    try {
      // optimistic
      setItems((prev) =>
        prev.map((x) => (x.status === "UNREAD" ? { ...x, status: "READ" } : x))
      );
      const ok = await markAllRead();
      if (!ok) {
        // rollback (ง่าย ๆ: โหลดใหม่)
        const fresh = await fetchNotifications("UNREAD", 12);
        setItems(fresh);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        aria-label="Notifications"
        onClick={toggle}
        className="relative inline-flex items-center justify-center rounded-full p-2 cursor-pointer"
      >
        {/* bell icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="#615fff"
            d="M14.25 18.75a2.25 2.25 0 11-4.5 0m9-6a7.5 7.5 0 10-15 0c0 3.75-1.5 4.5-1.5 4.5h18s-1.5-.75-1.5-4.5z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-[11px] font-semibold text-white flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-96 max-w-[92vw] rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <p className="text-sm font-semibold text-white">การแจ้งเตือน</p>
            <button
              onClick={onMarkAll}
              disabled={busy || unreadCount === 0}
              className={`text-xs rounded px-2 py-1 ${
                unreadCount === 0
                  ? "text-gray-500"
                  : "text-indigo-400 hover:text-indigo-300"
              }`}
              title="ทำเครื่องหมายว่าอ่านทั้งหมด"
            >
              read all
            </button>
          </div>

          <div className="max-h-[70vh] overflow-auto divide-y divide-gray-800">
            {items.length === 0 ? (
              <div className="p-6 text-sm text-gray-400">
                ยังไม่มีการแจ้งเตือน
              </div>
            ) : (
              items.map((n) => {
                console.log(n.data, "n.data");
                const href = hrefNotiBadge(n);

                return (
                  <div
                    key={n._id}
                    className="flex items-start gap-3 px-4 py-3 bg-transparent hover:bg-gray-800/60 transition"
                  >
                    <div className="pt-1">
                      {/* status dot */}
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${
                          n.status === "UNREAD"
                            ? "bg-indigo-400"
                            : "bg-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            n.type === "ORDER_PAYMENT_EXPIRED"
                              ? "text-red-700"
                              : "text-white"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[11px] text-gray-400">
                          • {fmtTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-300 line-clamp-2">
                        {n.body}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        {href && (
                          <Link
                            href={href}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline-offset-2 hover:underline"
                          >
                            ดูรายละเอียด
                          </Link>
                        )}
                        {n.status === "UNREAD" && (
                          <button
                            onClick={() => onMarkOne(n._id)}
                            className="text-xs text-gray-400 hover:text-gray-200"
                          >
                            ทำเป็นอ่านแล้ว
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
