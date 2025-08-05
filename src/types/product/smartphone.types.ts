import { ProductBase, ProductVariantBase } from "./base/product-base.types";
// import { ProductType } from "./enums/product-type.enum";
// import { ProductCategory } from "./enums/product-category.enum";

export interface Smartphone extends ProductBase {
  variants: ProductVariantBase[];      // เช่น สี, ความจุ
}
