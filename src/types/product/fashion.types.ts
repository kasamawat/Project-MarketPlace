import { ProductBase, ProductVariantBase } from "./base/product-base.types";

export interface FashionProduct extends ProductBase {
  variants: ProductVariantBase[];     // เช่น สี, ไซส์
}
