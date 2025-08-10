// src/types/product-base.types.ts
import { ProductCategory } from "../enums/product-category.enum";
import { ProductType } from "../enums/product-type.enum";
import { Store } from "@/types/store.types";

export type ProductStatus = "draft" | "pending" | "approved" | "rejected" | "published" | "unpublished";

export interface ProductVariantBase {
  _id?: string; // UUID
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
  category: ProductCategory;
  type: ProductType;
  store: {
    _id: string,
    name: string,
    logoUrl: string,
    coverUrl: string,
    slug: string,
    description: string,
    phone: string,
    productCategory: string,
  }
  price?: number;
  stock?: number;
  variants?: ProductVariantBase[];
  status?: ProductStatus;
}

// src/types/product-base.types.ts

export type ProductDetailFormInput = Pick<
  ProductBase,
  "name" | "description" | "image" | "category" | "type"
>;

export type ManageProductFormInput = Pick<
  ProductBase,
  "_id" | "price" | "stock" | "variants" | "category"
>;
