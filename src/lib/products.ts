import { Product } from "@/types/product/product.types";
import { allProducts } from "@/mock/mock";

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

export async function getProductsByStore(
  id: string | number
): Promise<Product[]> {
  let products: Product[] = [];

  products = await getAllProducts();

  const storeId = id;
  return products.filter((p) => p.storeId === storeId);
}