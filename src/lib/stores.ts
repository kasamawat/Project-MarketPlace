import { Store } from "@/types/store.types";
import { allStores } from "@/mock/mockStores";

export async function getAllStores(): Promise<Store[]>{
    return allStores;
}

export async function getStoreById(
  id: string | number
): Promise<Store | null> {
  let stores: Store[] = [];

  stores = await getAllStores();

  const storeId = id;
  return stores.find((p) => p.id === storeId) || null;
}