// src/types/product-base.types.ts
import { ProductCategory } from "../enums/product-category.enum";
import { ProductType } from "../enums/product-type.enum";
import { Store } from "@/types/store.types";

export interface ProductVariant {
  id:  string; // UUID
  name: string; // เช่น "Color"
  value?: string; // เช่น "Black"
  image?: string;
  price?: number; // เช่น +200
  stock?: number; // เช่น 10 ชิ้น
  variants?: ProductVariant[];
  status?: "normal" | "editing" | "new";
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
  image?: string;
  price?: number;
  category: ProductCategory;
  type: ProductType;
  store?: Store;
  
  // เพิ่มเพื่อใช้ในหน้าจอเพิ่ม/แสดงสินค้า
  stock?: number;
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
