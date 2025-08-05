import { ProductVariantBase } from "@/types/product/base/product-base.types";

export function removeVariantInTree(
  variants: ProductVariantBase[] = [],
  targetId: string | number
): ProductVariantBase[] {
  return variants
    .map((v) => {
      // ลบใน sub-variants ก่อน
      const newVariants = Array.isArray(v.variants)
        ? removeVariantInTree(v.variants, targetId)
        : [];

      // ถ้า id ตรงกับ target → ลบทิ้ง (filter ด้านล่าง)
      if (v._id?.toString() === targetId) return null;

      // ถ้า sub-variants ว่าง
      if (!newVariants || newVariants.length === 0) {
        return {
          ...v,
          variants: [],
          price: 0,
          stock: 0,
          image: "",
        };
      }

      // เหลือ sub-variants
      return {
        ...v,
        variants: newVariants,
      };
    })
    .filter(Boolean) as ProductVariantBase[];
}

