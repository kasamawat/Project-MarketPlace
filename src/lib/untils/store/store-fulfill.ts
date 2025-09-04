import { StoreOrderItemLite } from "@/lib/helpers/order/seller/store-order-detail";

/** ===== Utils ===== */
export const badgeClassByStatus = (s?: string) => {
  const x = (s || "").toLowerCase();
  if (["paid", "delivered", "fulfilled"].includes(x))
    return "bg-green-100 text-green-800";
  if (["processing", "to_fulfill", "packed"].includes(x))
    return "bg-yellow-100 text-yellow-800";
  if (["shipped"].includes(x)) return "bg-blue-100 text-blue-800";
  if (["awaiting_payment", "pending_payment"].includes(x))
    return "bg-amber-100 text-amber-800";
  if (["canceled", "expired", "returned"].includes(x))
    return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};


export const humanQty = (it: StoreOrderItemLite) => {
  const q = it.quantity;
  const pk = it.packedQty || 0;
  const sh = it.shippedQty || 0;
  const dv = it.deliveredQty || 0;
  const cz = it.canceledQty || 0;
  const outstanding = Math.max(0, q - pk - cz);
  return { outstanding, packed: pk, shipped: sh, delivered: dv, canceled: cz, total: q };
};
