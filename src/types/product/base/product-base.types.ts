// src/types/product-base.types.ts
import { ProductCategory } from "../enums/product-category.enum";
import { ProductType } from "../enums/product-type.enum";
import { Store } from "@/types/store.types";

export interface ProductVariantBase {
  _id?:  string; // UUID
  name: string; // เช่น "Color"
  value?: string; // เช่น "Black"
  image?: string;
  price?: number; // เช่น +200
  stock?: number; // เช่น 10 ชิ้น
  variants?: ProductVariantBase[];
}

export interface ProductBase {
  _id: string;
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
  variants?: ProductVariantBase[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
