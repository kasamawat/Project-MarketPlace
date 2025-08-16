import { SkuRow } from "@/types/product/products.types";

// ===== helpers =====
const normAttrs = (a: Record<string, string> = {}) =>
  Object.entries(a)
    .map(([k, v]) => [k.trim(), String(v ?? "").trim()] as const)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("|"); // เช่น "Color=Red|Size=L"

const equalSku = (a: SkuRow, b: SkuRow) =>
  normAttrs(a.attributes) === normAttrs(b.attributes) &&
  (a.skuCode ?? "") === (b.skuCode ?? "") &&
  (a.image ?? "") === (b.image ?? "") &&
  (a.purchasable ?? true) === (b.purchasable ?? true) &&
  (a.price ?? null) === (b.price ?? null);

export function diffSkus(original: SkuRow[], current: SkuRow[]) {
  const byId = new Map(original.filter(x => x._id).map(x => [x._id!, x]));
  const currentIds = new Set(current.filter(x => x._id).map(x => x._id!));
  const originalIds = new Set(original.filter(x => x._id).map(x => x._id!));

  const create = current
    .filter(r => !r._id)
    .map(({ _id, ...rest }) => rest); // SkuInput

  const update = current
    .filter(r => r._id && !equalSku(r, byId.get(r._id!)!))
    .map(r => ({
      _id: r._id!,
      skuCode: r.skuCode,
      attributes: r.attributes,
      price: r.price,
      image: r.image,
      purchasable: r.purchasable,
    })); // SkuUpdateDto

  const del = [...originalIds].filter(id => !currentIds.has(id));

  return { create, update, delete: del };
}
