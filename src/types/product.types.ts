export enum ProductType {
  Fashion = "fashion",
  Electronics = "electronics",
  Furniture = "furniture",
}

export type Product = {
  id: number;
  name: string;
  category: string;
  type: ProductType;
  image: string;
  price: number;
};