// app/api/search/route.ts
import { getAllProducts } from "@/lib/products";
import { getAllStores } from "@/lib/stores";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const products = await getAllProducts();
  const stores = await getAllStores();

  const allItems = [
    ...products.map((p) => ({
      id: p.id,
      name: p.name,
      type: "product" as const,
    })),
    ...stores.map((s) => ({
      id: s.id,
      name: s.name,
      type: "store" as const,
    })),
  ];

  const filtered = allItems.filter((item) =>
    item.name.toLowerCase().includes(query)
  );

  return Response.json(filtered);
}
