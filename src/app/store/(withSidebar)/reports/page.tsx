// src/app/store/(withSidebar)/reports/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Summary = {
  revenue: number; // รายได้รวม
  orders: number; // จำนวนออเดอร์
  aov: number; // average order value
};

type TopProduct = {
  id: string;
  name: string;
  qty: number;
  revenue: number;
};

type ReportResponse = {
  summary: Summary;
  topProducts: TopProduct[];
};

type RangePreset = "today" | "7d" | "30d" | "custom";

export default function ReportsPage() {
  const [preset, setPreset] = useState<RangePreset>("7d");
  const [from, setFrom] = useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = useState<string>(""); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // สร้างช่วงวันที่ตาม preset
  const params = useMemo(() => {
    const url = new URLSearchParams();
    if (preset !== "custom") {
      url.set("preset", preset);
    } else {
      if (from) url.set("from", from);
      if (to) url.set("to", to);
    }
    return url;
  }, [preset, from, to]);

  useEffect(() => {
    // โหลดข้อมูลเมื่อ filter เปลี่ยน
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: เปลี่ยนเป็น endpoint จริงของคุณ เช่น /store/reports
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/store/reports?${params.toString()}`,
          { credentials: "include", cache: "no-store" }
        );

        // ชั่วคราว: mock ถ้า endpoint ยังไม่พร้อม
        let payload: ReportResponse;
        if (!res.ok) {
          // mock
          payload = {
            summary: { revenue: 123456, orders: 42, aov: 2939.43 },
            topProducts: [
              { id: "P001", name: "Almond Granola", qty: 120, revenue: 36000 },
              { id: "P002", name: "Greek Yogurt", qty: 95, revenue: 28500 },
              { id: "P003", name: "Protein Bar", qty: 80, revenue: 24000 },
            ],
          };
        } else {
          payload = await res.json();
        }

        if (mounted) setData(payload);
      } catch (e) {
        if (mounted) setError("Failed to load report");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params]);

  const formatTHB = (n: number) =>
    `฿${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  const handleExport = async () => {
    try {
      // TODO: เปลี่ยนเป็น endpoint export ของคุณ เช่น /store/reports/export
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/store/reports/export?${params.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`Export failed (HTTP ${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reports_${
        preset === "custom" ? `${from}_${to}` : preset
      }.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
          <p className="text-sm text-gray-400">Sales performance overview</p>
        </div>
        <button
          onClick={handleExport}
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {(["today", "7d", "30d", "custom"] as RangePreset[]).map((r) => (
            <button
              key={r}
              onClick={() => setPreset(r)}
              className={[
                "rounded px-3 py-1.5 text-sm",
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
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded border border-gray-700 bg-gray-950 p-2 text-gray-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded border border-gray-700 bg-gray-950 p-2 text-gray-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Revenue</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {data ? formatTHB(data.summary.revenue) : "--"}
          </div>
        </div>
        <div className="rounded border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">Orders</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {data ? data.summary.orders.toLocaleString() : "--"}
          </div>
        </div>
        <div className="rounded border border-gray-800 bg-gray-900 p-4">
          <div className="text-sm text-gray-400">AOV</div>
          <div className="mt-1 text-2xl font-bold text-white">
            {data ? formatTHB(data.summary.aov) : "--"}
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

            {!loading &&
              data?.topProducts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-800 hover:bg-gray-800/40"
                >
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.qty.toLocaleString()}</td>
                  <td className="px-4 py-2">{formatTHB(p.revenue)}</td>
                </tr>
              ))}

            {!loading && !data && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
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
