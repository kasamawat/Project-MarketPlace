import { ProductBase, ProductVariant, ProductAttribute } from "./base/product-base.types";
// import { ProductType } from "./enums/product-type.enum";
// import { ProductCategory } from "./enums/product-category.enum";

export interface Smartphone extends ProductBase {
  variants: ProductVariant[];      // เช่น สี, ความจุ
  attributes: ProductAttribute[];  // เช่น แบรนด์, แบตเตอรี่, CPU
}
