import { Product, ProductType } from "@/types/product.types";
import { allProducts } from "./mockOwner1";

export async function getAllProducts(): Promise<Product[]> {
  return allProducts;
}

export async function getProduct(
  id: string | number
): Promise<Product | null> {
  let products: Product[] = [];

  products = await getAllProducts();

  const productId = id;
  return products.find((p) => p.id === productId) || null;
}