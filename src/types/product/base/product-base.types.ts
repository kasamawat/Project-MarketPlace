import { ProductCategory } from "../enums/product-category.enum";
import { ProductType } from "../enums/product-type.enum";
import { Store } from "@/types/store.types";

export interface ProductVariant {
  name: string; // เช่น "Color"
  value: string; // เช่น "Black"
  priceModifier?: number; // เพิ่มราคาถ้ามี เช่น +2000
  stock?: number; // จำนวนสินค้าที่เหลือในตัวเลือกนั้น
}

export interface ProductAttribute {
  key: string;   // เช่น "Battery"
  value: string; // เช่น "4000mAh"
}

export interface ProductBase {
  id: string | number;
  storeId?: string | number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: ProductCategory;
  type: ProductType;
  store: Store;
}
