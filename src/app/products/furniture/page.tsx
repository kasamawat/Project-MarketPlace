import { getFurnitureProducts, Product } from "@/lib/products";
import FurnitureClient from "./FurnitureClient";

export default async function FurniturePage() {
  const products: Product[] = await getFurnitureProducts();

  return <FurnitureClient products={products} />;
}
