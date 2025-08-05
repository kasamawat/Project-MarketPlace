// src/lib/mapMongoId.ts

import { ProductVariantBase } from "@/types/product/base/product-base.types";

type WithId<T> = Omit<T, "_id" | "variants"> & {
  id: string;
  variants?: WithId<T>[];
};

/**
 * แปลง Mongo _id เป็น id + map nested variants (recursive)
 */
export function mapMongoId<T extends { _id?: string; variants?: ProductVariantBase[] }>(doc: T): WithId<T> {
  const { _id, variants, ...rest } = doc;

  // Map variants recursive
  const mappedVariants = Array.isArray(variants)
    ? variants.map(mapMongoId)
    : undefined;

  return {
    ...rest,
    ...(mappedVariants ? { variants: mappedVariants } : {}),
    id: _id ?? "",
  } as WithId<T>;
}

/**
 * สำหรับ array หลายตัว
 */
export function mapMongoIdArray<T extends { _id?: string; variants?: ProductVariantBase[] }>(docs: T[]): WithId<T>[] {
  return docs.map(mapMongoId);
}
