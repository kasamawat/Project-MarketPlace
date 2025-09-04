"use client";

import React from "react";
import { attrsToText } from "@/lib/helpers/productList";
import {
  PACKAGE_TYPE,
  StoreOrderItemLite,
} from "@/lib/helpers/order/seller/store-order-detail";
import toast from "react-hot-toast";

export type PackPayload = {
  package: {
    boxType?: string;
    weightKg?: number;
    dimension?: { l?: number; w?: number; h?: number };
    note?: string;
  };
  items: { productId: string; skuId: string; qty: number }[];
};

function computeOutstanding(it: StoreOrderItemLite) {
  const total = it.quantity ?? 0;
  const packed = it.packedQty ?? 0;
  const canceled = it.canceledQty ?? 0;
  const outstanding = Math.max(0, total - packed - canceled);
  return { total, packed, outstanding };
}

export default function PACKEDModal({
  open,
  items,
  onClose,
  onSubmit,
}: {
  open: boolean;
  items: StoreOrderItemLite[];
  onClose: () => void;
  onSubmit: (payload: PackPayload) => void;
}) {
  const [selectedQty, setSelectedQty] = React.useState<Record<string, number>>(
    {}
  );
  const [packageMeta, setPackageMeta] = React.useState<PACKAGE_TYPE>({
    boxType: "BOX-M",
    weightKg: "",
    l: "",
    w: "",
    h: "",
    note: "",
  });

  React.useEffect(() => {
    // รีเซ็ตเมื่อเปิด/ปิด
    if (!open) {
      setSelectedQty({});
      setPackageMeta({
        boxType: "BOX-M",
        weightKg: "",
        l: "",
        w: "",
        h: "",
        note: "",
      });
    }
  }, [open]);

  const toggle = (
    productId: string,
    skuId: string,
    next: number,
    max: number
  ) => {
    const q = Math.max(0, Math.min(Number(next || 0), max));
    const key = `${productId}::${skuId}`;
    setSelectedQty((p) => ({ ...p, [key]: q }));
  };

  const doSubmit = () => {
    const itemsPayload = Object.entries(selectedQty)
      .map(([key, qty]) => {
        const [productId, skuId] = key.split("::");
        return { productId, skuId, qty: Number(qty) };
      })
      .filter((x) => x.qty > 0);

    if (!itemsPayload.length) return toast.error("Please Add Item");

    onSubmit({
      package: {
        boxType: packageMeta.boxType || undefined,
        weightKg: packageMeta.weightKg
          ? Number(packageMeta.weightKg)
          : undefined,
        dimension: {
          l: packageMeta.l ? Number(packageMeta.l) : undefined,
          w: packageMeta.w ? Number(packageMeta.w) : undefined,
          h: packageMeta.h ? Number(packageMeta.h) : undefined,
        },
        note: packageMeta.note || undefined,
      },
      items: itemsPayload,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-lg border border-gray-700 bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-white">
            Pack new package
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded text-white cursor-pointer"
          >
            X
          </button>
        </div>

        {/* Package meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <label className="text-sm text-gray-300">
            Box/Package
            <select
              className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={packageMeta.boxType}
              onChange={(e) =>
                setPackageMeta((m) => ({ ...m, boxType: e.target.value }))
              }
            >
              <option value="BOX-S">BOX-S</option>
              <option value="BOX-M">BOX-M</option>
              <option value="BOX-L">BOX-L</option>
              <option value="CUSTOM">CUSTOM</option>
            </select>
          </label>
          <label className="text-sm text-gray-300">
            Weight (kg)
            <input
              className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={packageMeta.weightKg}
              onChange={(e) =>
                setPackageMeta((m) => ({ ...m, weightKg: e.target.value }))
              }
              placeholder="e.g. 0.85"
              inputMode="decimal"
            />
          </label>
          <div className="grid grid-cols-3 gap-3 md:col-span-2">
            {(["l", "w", "h"] as const).map((k) => (
              <label key={k} className="text-sm text-gray-300">
                {k.toUpperCase()} (cm)
                <input
                  className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
                  value={packageMeta[k]}
                  onChange={(e) =>
                    setPackageMeta((m) => ({ ...m, [k]: e.target.value }))
                  }
                  inputMode="numeric"
                />
              </label>
            ))}
          </div>
          <label className="text-sm text-gray-300 md:col-span-2">
            Note
            <textarea
              className="mt-1 w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              rows={2}
              value={packageMeta.note}
              onChange={(e) =>
                setPackageMeta((m) => ({ ...m, note: e.target.value }))
              }
              placeholder="รายละเอียด/หมายเหตุการแพ็ก"
            />
          </label>
        </div>

        {/* Allocate qty */}
        <div className="rounded border border-gray-700 overflow-hidden">
          <div className="bg-gray-800 text-white px-4 py-2 text-sm">
            Allocate quantities
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-gray-100">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-center">Ordered</th>
                <th className="p-2 text-center">Packed</th>
                <th className="p-2 text-center">Outstanding</th>
                <th className="p-2 text-center">Pack now</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const q = computeOutstanding(it);
                const max = q.outstanding;
                return (
                  <tr key={it.skuId} className="border-t border-gray-700">
                    <td className="p-2">
                      <div className="font-medium text-white">{it.name}</div>
                      <div className="text-gray-400 text-xs">
                        {attrsToText(it.attributes)}
                      </div>
                    </td>
                    <td className="p-2 text-center">{q.total}</td>
                    <td className="p-2 text-center">{q.packed}</td>
                    <td className="p-2 text-center">{q.outstanding}</td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min={0}
                        max={max}
                        value={selectedQty[`${it.productId}::${it.skuId}`] ?? 0}
                        onChange={(e) =>
                          toggle(
                            String(it.productId),
                            String(it.skuId),
                            Number(e.target.value || 0),
                            max
                          )
                        }
                        disabled={q.outstanding === 0}
                        className={`w-24 border border-gray-700 p-1 bg-gray-800 text-white rounded text-center ${
                          q.outstanding > 0 ? "" : "opacity-50"
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            Confirm PACKED
          </button>
        </div>
      </div>
    </div>
  );
}
