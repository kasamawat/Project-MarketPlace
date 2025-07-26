import { ProductAttribute, ProductBase, ProductVariant } from "./base/product-base.types";
import { ProductCategory } from "./enums/product-category.enum";
import { ProductType } from "./enums/product-type.enum";


export interface FashionProduct extends ProductBase {
  variants: ProductVariant[];     // เช่น สี, ไซส์
  attributes: ProductAttribute[]; // เช่น วัสดุ, เพศ, แบรนด์
}
