import { Store } from "@/types/store.types";

// Mock Stores
export const stores: Store[] = [
  {
    _id: "store-001",
    name: "Tech Haven",
    slug: "tech-haven",
    description: "ร้านสินค้าอิเล็กทรอนิกส์ทันสมัยทุกชนิด",
    image: "/images/store1.jpg",
    ownerId: "test-1",
    status:"approved",
    createdAt: new Date(),
  },
  {
    _id: "store-002",
    name: "Home & Fashion",
    slug: "home-and-fashion",
    description: "แฟชั่นและเฟอร์นิเจอร์สำหรับทุกคน",
    image: "/images/store2.jpg",
    ownerId: "test-2",
    status:"approved",
    createdAt: new Date(),
  },
];

export const allStores: Store[] = stores;