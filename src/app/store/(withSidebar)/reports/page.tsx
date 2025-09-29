// src/app/store/(withSidebar)/reports/page.tsx
"use client";

import { attrsToText } from "@/lib/helpers/productList";
import { FulfillmentStatus } from "@/types/order/order.types";
import { useEffect, useMemo, useRef, useState } from "react";

type Summary = {
  revenue: number; // รายได้รวม
  orders: number; // จำนวนออเดอร์
  aov: number; // average order value
};

type TopProduct = {
  productId: string;
  skuId: string;
  name: string;
  attributes: Record<string, string>;
  fulfillStatus: FulfillmentStatus;
  qty: number;
  revenue: number;
  deliveredAt: string;
};

type ReportResponse = {
  summary: Summary;
  topProducts: TopProduct[];
};

type RangePreset = "today" | "7d" | "30d" | "custom";

const API = process.env.NEXT_PUBLIC_API_URL!;

function toYMD(d: Date) {
  // แปลงเป็น YYYY-MM-DD (ใช้ local TZ)
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export default function ReportsPage() {
  const [preset, setPreset] = useState<RangePreset>("7d");
  const [from, setFrom] = useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = useState<string>(""); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  console.log(data, "data");

  // กำหนดค่า from/to อัตโนมัติเมื่อ preset เปลี่ยน (ยกเว้น custom)
  useEffect(() => {
    if (preset === "custom") return;
    const today = new Date();
    if (preset === "today") {
      const ymd = toYMD(today);
      setFrom(ymd);
      setTo(ymd);
    } else if (preset === "7d") {
      setFrom(toYMD(addDays(today, -6)));
      setTo(toYMD(today));
    } else if (preset === "30d") {
      setFrom(toYMD(addDays(today, -29)));
      setTo(toYMD(today));
    }
  }, [preset]);

  // validate ช่วงวันที่ (เฉพาะ custom)
  const dateError = useMemo(() => {
    if (preset !== "custom") return null;
    if (!from || !to) return "Please select both From and To.";
    if (new Date(from) > new Date(to)) return "From must be before To.";
    return null;
  }, [preset, from, to]);

  // query params ที่จะยิงจริง (จากช่วงวันที่ที่คำนวณแล้ว)
  const searchParams = useMemo(() => {
    const url = new URLSearchParams();
    url.set("from", from);
    url.set("to", to);
    // ถ้ามี timezone ฝั่ง BE อยากได้ส่งเพิ่ม เช่น Asia/Bangkok
    // url.set("tz", "Asia/Bangkok");
    return url;
  }, [from, to]);

  // แสดงช่วงวันที่สรุป
  const dateLabel = useMemo(() => {
    if (!from || !to) return "-";
    return from === to ? from : `${from} → ${to}`;
  }, [from, to]);

  // โหลดข้อมูลทุกครั้งที่ช่วงวันเปลี่ยน
  useEffect(() => {
    if (!from || !to) return; // ยังไม่พร้อม
    if (preset === "custom" && dateError) return; // invalid

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API}/store/reports?${searchParams.toString()}`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        let payload: ReportResponse;
        if (!res.ok) {
          // mock (ลบทิ้งได้เมื่อ BE พร้อม)
          payload = {
            summary: { revenue: 0, orders: 0, aov: 0 },
            topProducts: [],
          };
        } else {
          payload = (await res.json()) as ReportResponse;
        }
        setData(payload);
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") {
          setError("Failed to load report");
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API, searchParams, preset, dateError]);

  const formatTHB = (n: number) =>
    `฿${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  const handleExport = async () => {
    try {
      const res = await fetch(
        `${API}/store/reports/export?${searchParams.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`Export failed (HTTP ${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filenameSuffix = from && to ? `${from}_${to}` : preset;
      a.href = url;
      a.download = `reports_${filenameSuffix}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  const presets: RangePreset[] = ["today", "7d", "30d", "custom"];

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
          <p className="text-sm text-gray-400">
            Sales performance overview &nbsp;
            <span className="text-gray-300">({dateLabel})</span>
          </p>
        </div>
        <button
          onClick={handleExport}
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          disabled={!from || !to || !!dateError}
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {presets.map((r) => (
            <button
              key={r}
              onClick={() => setPreset(r)}
              className={[
                "rounded px-3 py-1.5 text-sm capitalize",
                preset === r
                  ? "bg-gray-300 text-black"
                  : "border border-gray-700 text-gray-300 hover:bg-gray-800",
              ].join(" ")}
            >
              {r === "today"
                ? "Today"
                : r === "7d"
                ? "Last 7 days"
                : r === "30d"
                ? "Last 30 days"
                : "Custom"}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="ml-2 rounded border border-gray-700 bg-gray-950 p-2 text-gray-100"
              />
            </label>
            <label className="text-sm text-gray-300">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="ml-2 rounded border border-gray-700 bg-gray-950 p-2 text-gray-100"
              />
            </label>
            {dateError && (
              <span className="text-xs text-red-300 ml-2">{dateError}</span>
            )}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Revenue</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {data ? formatTHB(data.summary.revenue) : loading ? "…" : "--"}
          </div>
        </div>
        <div className="rounded border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Orders</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {data ? data.summary.orders.toLocaleString() : loading ? "…" : "--"}
          </div>
        </div>
        <div className="rounded border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">AOV</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {data ? formatTHB(data.summary.aov) : loading ? "…" : "--"}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-200">
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Qty</th>
              <th className="px-4 py-2 text-left">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && data?.topProducts?.length
              ? data.topProducts.map((p) => (
                  <tr
                    key={`${p.productId}::${p.skuId}`}
                    className="border-b border-gray-800 hover:bg-gray-800/40"
                  >
                    <td className="px-4 py-2">
                      <div>
                        <div>{p.name}</div>
                        <div className="text-gray-400 text-xs">
                          {attrsToText(p.attributes)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          deliveredAt: {p.deliveredAt
                            ? new Date(p.deliveredAt).toLocaleString("th-TH", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">{p.qty.toLocaleString()}</td>
                    <td className="px-4 py-2">{formatTHB(p.revenue)}</td>
                  </tr>
                ))
              : !loading && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      No data
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>

      {error && <p className="mt-3 text-sm text-red-300">Error: {error}</p>}
    </div>
  );
}
