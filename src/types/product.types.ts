import { Store } from "@/types/store.types";

export enum ProductType {
  Fashion = "fashion",
  Electronics = "electronics",
  Furniture = "furniture",
}
export enum ProductCategory {
  Chair = "Chair",
  Sofa = "Sofa",
  Bookshelf = "Bookshelf",
  Table = "Table",
  Smartphone = "Smartphone",
  Laptop = "Laptop",
  TShirt = "T-Shirt",
  Jacket = "Jacket",
}

export type Product = {
  id: string | number; // Allow both string (UUID) and number (ID)
  storeId?: string | number
  name: string;
  category: ProductCategory;
  type: ProductType;
  description: string;
  image: string;
  price: number;
  stock?: number; // Optional stock property
  store: Store;
};