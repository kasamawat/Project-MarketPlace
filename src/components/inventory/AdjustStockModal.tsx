// components/inventory/AdjustStockModal.tsx
import { SkuRow } from "@/types/product/products.types";
import { useEffect, useState } from "react";

export default function AdjustStockModal({
  value,
  open,
  onClose,
  onSubmit,
}: {
  value: {
    productId: string;
    sku: SkuRow;
  } | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (delta: number, reason: string) => Promise<void> | void;
}) {
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState<string>("manual");

  useEffect(() => {
    if (!open) return; // รีเซ็ตเฉพาะตอนเปิด
    setDelta(0);
    setReason("manual");
  }, [open, value?.productId, value?.sku?._id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">Adjust Stock</h3>
        <h3 className="text-md font-semibold text-white mb-4">
          ProductID: {value?.productId}
        </h3>
        <h3 className="text-md font-semibold text-white mb-4">
          SkuCode: {value?.sku.skuCode}
        </h3>

        <label className="block text-sm text-gray-300 mb-1">Delta (+/-)</label>
        <input
          type="number"
          className="w-full mb-3 p-2 rounded border border-gray-600 bg-gray-800 text-white"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          placeholder="e.g. +10, -2"
        />

        <label className="block text-sm text-gray-300 mb-1">Reason</label>
        <input
          className="w-full mb-4 p-2 rounded border border-gray-600 bg-gray-800 text-white"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="manual / restock / shrinkage"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await onSubmit(delta, reason);
              onClose();
            }}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            disabled={!Number.isInteger(delta) || delta === 0}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
