import { Store } from "@/types/store.types";

// Mock Stores
export const stores: Store[] = [
  {
    id: "store-001",
    name: "Tech Haven",
    description: "ร้านสินค้าอิเล็กทรอนิกส์ทันสมัยทุกชนิด",
    image: "/images/store1.jpg",
    ownerId: "test-1",

  },
  {
    id: "store-002",
    name: "Home & Fashion",
    description: "แฟชั่นและเฟอร์นิเจอร์สำหรับทุกคน",
    image: "/images/store2.jpg",
    ownerId: "test-2"
  },
];

export const allStores: Store[] = stores;