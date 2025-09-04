"use client";

import {
  FulfillmentPackage,
  METHOD_TYPE,
  SHIPMENT_TYPE,
} from "@/lib/helpers/order/seller/store-order-detail";
import React from "react";
import toast from "react-hot-toast";

export type ShipPayload = {
  shipment: {
    carrier: string;
    trackingNumber: string;
    method?: METHOD_TYPE;
    shippedAt?: string; // ISO
    note?: string;
  };
  packageIds: string[];
};

export default function SHIPPEDModal({
  open,
  packages,
  onClose,
  onSubmit,
}: {
  open: boolean;
  packages: FulfillmentPackage[];
  onClose: () => void;
  onSubmit: (payload: ShipPayload) => void;
}) {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [shipMeta, setShipMeta] = React.useState<SHIPMENT_TYPE>({
    carrier: "TH-EMS",
    trackingNumber: "",
    method: "DROP_OFF" as METHOD_TYPE,
    shippedAt: new Date().toISOString().slice(0, 16),
    note: "",
  });

  // แยกเงื่อนไขว่า "พร้อมส่ง" = ยังไม่ผูก shipment และมี item จริง
  const isShippable = (p: FulfillmentPackage) =>
    !p.shipmentId && (p.items?.length ?? 0) > 0;

  // 1) filter + sort ด้วย useMemo
  const shippablePackages = React.useMemo(
    () =>
      (packages ?? []).filter(isShippable).sort((a, b) => {
        // ใหม่อยู่บน
        const ta = new Date(a.createdAt ?? 0).getTime();
        const tb = new Date(b.createdAt ?? 0).getTime();
        return tb - ta;
      }),
    [packages]
  );

  React.useEffect(() => {
    if (!open) {
      setSelected({});
      setShipMeta({
        carrier: "TH-EMS",
        trackingNumber: "",
        method: "DROP_OFF",
        shippedAt: new Date().toISOString().slice(0, 16),
        note: "",
      });
    }
  }, [open]);

  // 2) clean selection เมื่อรายการเปลี่ยน
  React.useEffect(() => {
    setSelected((prev) => {
      const next: Record<string, boolean> = {};
      for (const p of shippablePackages) {
        if (prev[p._id]) next[p._id] = true;
      }
      return next;
    });
  }, [shippablePackages]);

  // 3) ใช้รายการที่ filter แล้วแทน packagesFilter เดิม
  // const packagesFilter = packages.filter((p) => !p.shipmentId);
  const packagesFilter = shippablePackages;

  const toggle = (id: string) => setSelected((p) => ({ ...p, [id]: !p[id] }));

  // 4) กัน submit กรอกไม่ครบ + เคส race
  const doSubmit = async () => {
    const packageIds = Object.entries(selected)
      .filter(([, on]) => on)
      .map(([id]) => id);

    if (!packageIds.length) return toast.error("Please select packages");
    if (!shipMeta.trackingNumber.trim())
      return toast.error("Please enter tracking number");

    try {
      await onSubmit({
        shipment: {
          carrier: shipMeta.carrier,
          trackingNumber: shipMeta.trackingNumber.trim(),
          method: shipMeta.method,
          shippedAt: shipMeta.shippedAt
            ? new Date(shipMeta.shippedAt).toISOString()
            : undefined,
          note: shipMeta.note || undefined,
        },
        packageIds,
      });
    } catch (e) {
      // สมมติ BE ตีกลับ 409/400 ถ้ากล่องถูก ship ไปแล้ว
      toast.error("Some packages were already shipped. Refreshing…");
      // ให้ parent รีโหลด order ใหม่หลัง onSubmit โยน error กลับ หรือมี callback refresh แยก
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-lg border border-gray-700 bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-white">
            Create shipment
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded  text-white cursor-pointer"
          >
            X
          </button>
        </div>

        {/* เลือกกล่อง */}
        <div className="rounded border border-gray-700 overflow-hidden mb-4">
          <div className="bg-gray-800 text-white px-4 py-2 text-sm">
            Select packages
          </div>
          {!packagesFilter.length ? (
            <div className="p-4 text-gray-400 text-sm">ยังไม่มีกล่อง</div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {packagesFilter.map((p) => (
                <li
                  key={p._id}
                  className="p-3 flex items-start gap-3"
                  onClick={() => toggle(p._id)}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!selected[p._id]}
                    onChange={() => toggle(p._id)}
                    onClick={() => toggle(p._id)}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {p.code || p._id.slice(-6)} — {p.boxType || "-"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      Weight: {p.weightKg ?? "-"} kg | Size:{" "}
                      {p.dimension?.l ?? "-"}×{p.dimension?.w ?? "-"}×
                      {p.dimension?.h ?? "-"} cm
                    </div>
                    <div className="text-gray-300 text-xs mt-1">
                      Items:{" "}
                      {p.items
                        .map((x) => `${x.productName || x.skuId}×${x.qty}`)
                        .join(", ")}
                    </div>
                    {p.note ? (
                      <div className="text-gray-400 text-xs mt-1">
                        Note: {p.note}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Shipment meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm text-gray-300">
            Carrier
            <select
              className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={shipMeta.carrier}
              onChange={(e) =>
                setShipMeta((m) => ({ ...m, carrier: e.target.value }))
              }
            >
              <option value="TH-EMS">Thailand Post EMS</option>
              <option value="TH-KERRY">Kerry</option>
              <option value="TH-EASY">EASY</option>
              <option value="TH-THUNDER">Thunder</option>
              <option value="TH-J&T">J&T</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label className="text-sm text-gray-300">
            Tracking No.
            <input
              className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={shipMeta.trackingNumber}
              onChange={(e) =>
                setShipMeta((m) => ({ ...m, trackingNumber: e.target.value }))
              }
              placeholder="เช่น EX123456789TH"
            />
          </label>

          <label className="text-sm text-gray-300">
            Shipped At
            <input
              type="datetime-local"
              className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={shipMeta.shippedAt}
              onChange={(e) =>
                setShipMeta((m) => ({ ...m, shippedAt: e.target.value }))
              }
            />
          </label>
          <label className="text-sm text-gray-300">
            Method
            <select
              className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={shipMeta.method}
              onChange={(e) =>
                setShipMeta((m) => ({
                  ...m,
                  method: e.target.value as METHOD_TYPE,
                }))
              }
            >
              <option value="DROP_OFF">Drop-off</option>
              <option value="PICKUP">Pickup</option>
            </select>
          </label>

          <label className="text-sm text-gray-300 md:col-span-2">
            Note
            <textarea
              className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              rows={2}
              value={shipMeta.note}
              onChange={(e) =>
                setShipMeta((m) => ({ ...m, note: e.target.value }))
              }
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-gray-600 text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={doSubmit}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Create shipment
          </button>
        </div>
      </div>
    </div>
  );
}
