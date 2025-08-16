import { PublicProductListQuery } from "@/types/product/products.types";

// libs/url.ts
export function buildPublicProductsURL(
  apiBase: string,
  q: PublicProductListQuery
) {
  const url = new URL(`${apiBase}/public/products`);
  if (q.q) url.searchParams.set("q", q.q);
  if (q.category) url.searchParams.set("category", q.category);
  if (q.sort) url.searchParams.set("sort", q.sort);
  if (q.page) url.searchParams.set("page", String(q.page));
  if (q.limit) url.searchParams.set("limit", String(q.limit));
  return url.toString();
}