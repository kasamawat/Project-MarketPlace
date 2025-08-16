import { SkuRow } from "@/types/product/products.types";

export function fmtPrice(n?: number) {
  if (typeof n !== "number") return "";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function attrsToText(attrs: Record<string, string>) {
  const keys = Object.keys(attrs);
  if (!keys.length) return "—";
  return keys
    .sort((a, b) => a.localeCompare(b))
    .map((k) => `${k}: ${attrs[k]}`)
    .join(" · ");
}

export function priceSummaryFor(
  skus: SkuRow[] | undefined,
  defaultPrice?: number
): { count: number; text: string } {
  if (!skus?.length) {
    return { count: 0, text: fmtPrice(defaultPrice) || "—" };
  }
  const prices = skus.map((s) =>
    typeof s.price === "number" ? s.price : defaultPrice ?? 0
  );
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return {
    count: skus.length,
    text: min === max ? fmtPrice(min) : `${fmtPrice(min)}–${fmtPrice(max)}`,
  };
}