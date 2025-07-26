// lib/search.ts

import { getAllProducts } from "./products";
import { getAllStores } from "./stores";

export async function getSearchResults(query: string) {
    const q = query.toLowerCase();

    const products = await getAllProducts();
    const stores = await getAllStores();

    const results = [
        ...stores.map((s) => ({ id: s.id, name: s.name, type: "store" as const })),
        ...products.map((p) => ({ id: p.id, name: p.name, type: "product" as const })),
    ];

    return results.filter((item) => item.name.toLowerCase().includes(q));
}
