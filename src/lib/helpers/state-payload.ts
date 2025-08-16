import { CreateProductPayload, ProductEditorState, UpdateProductPayload } from "@/types/product/products.types";

export function toCreatePayload(s: ProductEditorState): CreateProductPayload {
  // ถ้ายังไม่มี SKU เลย ให้สร้าง base SKU อัตโนมัติ
  const skus = (s.skus ?? []).length > 0 ? s.skus : [{ attributes: {}, price: s.defaultPrice }];
  return {
    name: s.name,
    description: s.description || undefined,
    image: s.image || undefined,
    category: s.category,
    type: s.type,
    defaultPrice: s.defaultPrice ?? undefined,
    status: s.status,
    skus,
  };
}

export function toUpdatePayload(s: ProductEditorState): UpdateProductPayload {
  return {
    name: s.name,
    description: s.description || undefined,
    image: s.image || undefined,
    category: s.category,
    type: s.type,
    defaultPrice: s.defaultPrice ?? undefined,
    status: s.status,
  };
}
