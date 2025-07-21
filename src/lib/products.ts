import { Product, ProductType } from "@/types/product.types";
import { fashionProducts } from "./mockFashion";
import { electronicsProducts } from "./mockElectronics";
import { furnitureProducts } from "./mockFurniture";

export async function getFashionProducts(): Promise<Product[]> {
  return fashionProducts;
}

export async function getElectronicsProducts(): Promise<Product[]> {
  return electronicsProducts;
}

export async function getFurnitureProducts(): Promise<Product[]> {
  return furnitureProducts;
}

export async function getProduct(
  type: ProductType,
  id: string
): Promise<Product | null> {
  let products: Product[] = [];

  switch (type) {
    case ProductType.Fashion:
      products = await getFashionProducts();
      break;
    case ProductType.Electronics:
      products = await getElectronicsProducts();
      break;
    case ProductType.Furniture:
      products = await getFurnitureProducts();
      break;
    default:
      return null;
  }

  const productId = parseInt(id, 10);
  return products.find((p) => p.id === productId) || null;
}