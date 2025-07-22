import { Product, ProductCategory, ProductType } from "@/types/product.types";
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

// Products for Store 1
export const owner1Products: Product[] = [
  {
    id: "4ac460a1-52de-4b3f-bac5-0197b2e99d51",
    name: "Smartphone - Model X",
    type: ProductType.Electronics,
    category: ProductCategory.Smartphone,
    image: "/images/electronics1.jpg",
    description: "A high-end smartphone with a sleek design and powerful features.",
    price: 699.99,
    stock: 10,
    storeId: "store-001",
    store: {
      id: "store-001",
      name: "Tech Haven",
      description: "ร้านสินค้าอิเล็กทรอนิกส์ทันสมัยทุกชนิด",
      image: "/images/store1.jpg",
      ownerId: "test-1",

    },
  },
  {
    id: "524dfc0e-06b3-41c2-9109-3be2d00913a3",
    name: "Laptop - Model Y",
    type: ProductType.Electronics,
    category: ProductCategory.Laptop,
    image: "/images/electronics2.jpg",
    description: "A lightweight laptop with a long-lasting battery and high performance.",
    price: 1299.99,
    stock: 10,
    storeId: "store-001",
    store: {
      id: "store-001",
      name: "Tech Haven",
      description: "ร้านสินค้าอิเล็กทรอนิกส์ทันสมัยทุกชนิด",
      image: "/images/store1.jpg",
      ownerId: "test-1",

    },
  },
];

// Products for Store 2
export const owner2Products: Product[] = [
  {
    id: "a6dbd8aa-04a9-4e71-9c6a-1f0d702f712a",
    name: "T-Shirt - White",
    type: ProductType.Fashion,
    category: ProductCategory.TShirt,
    image: "/images/fashion1.jpg",
    description: "A comfortable white t-shirt made from 100% cotton.",
    price: 19.99,
    stock: 10,
    storeId: "store-002",
    store: {
      id: "store-002",
      name: "Home & Fashion",
      description: "แฟชั่นและเฟอร์นิเจอร์สำหรับทุกคน",
      image: "/images/store2.jpg",
      ownerId: "test-2"
    },
  },
  {
    id: "2e2f2452-8e71-4625-b89e-09fa44749355",
    name: "Denim Jacket",
    type: ProductType.Fashion,
    category: ProductCategory.Jacket,
    image: "/images/fashion2.jpg",
    description: "A stylish denim jacket perfect for casual outings.",
    price: 49.99,
    stock: 10,
    storeId: "store-002",
    store: {
      id: "store-002",
      name: "Home & Fashion",
      description: "แฟชั่นและเฟอร์นิเจอร์สำหรับทุกคน",
      image: "/images/store2.jpg",
      ownerId: "test-2"
    },
  },
  {
    id: "dcf7b6fa-66bb-4710-86ee-fb7f2468caa5",
    name: "Wooden Chair",
    type: ProductType.Furniture,
    category: ProductCategory.Chair,
    image: "/images/furniture1.jpg",
    description: "A classic wooden chair with a comfortable design.",
    price: 39.99,
    stock: 10,
    storeId: "store-002",
    store: {
      id: "store-002",
      name: "Home & Fashion",
      description: "แฟชั่นและเฟอร์นิเจอร์สำหรับทุกคน",
      image: "/images/store2.jpg",
      ownerId: "test-2"
    },
  },
  {
    id: "f7b9dc6f-4161-4266-9cb1-5053e8ef31d9",
    name: "Modern Sofa",
    type: ProductType.Furniture,
    category: ProductCategory.Sofa,
    image: "/images/furniture2.jpg",
    description: "A stylish modern sofa that fits any living room.",
    price: 299.99,
    stock: 10,
    storeId: "store-002",
    store: {
      id: "store-002",
      name: "Home & Fashion",
      description: "แฟชั่นและเฟอร์นิเจอร์สำหรับทุกคน",
      image: "/images/store2.jpg",
      ownerId: "test-2"
    },
  },
  {
    id: "44a90a88-9ef4-4900-a6d2-27fcf0b126f7",
    name: "Bookshelf",
    type: ProductType.Furniture,
    category: ProductCategory.Bookshelf,
    image: "/images/furniture3.jpg",
    description: "A spacious bookshelf perfect for organizing your books.",
    price: 79.99,
    stock: 10,
    storeId: "store-002",
    store: {
      id: "store-002",
      name: "Home & Fashion",
      description: "แฟชั่นและเฟอร์นิเจอร์สำหรับทุกคน",
      image: "/images/store2.jpg",
      ownerId: "test-2"
    },
  },
  {
    id: "174ae071-6f3c-4ef6-bdad-b6482788d234",
    name: "Dining Table",
    type: ProductType.Furniture,
    category: ProductCategory.Table,
    image: "/images/furniture4.jpg",
    description: "A beautiful dining table that seats six people.",
    price: 249.99,
    stock: 10,
    storeId: "store-002",
    store: {
      id: "store-002",
      name: "Home & Fashion",
      description: "แฟชั่นและเฟอร์นิเจอร์สำหรับทุกคน",
      image: "/images/store2.jpg",
      ownerId: "test-2"
    },
  },
];

// All products
export const allProducts: Product[] = [...owner1Products, ...owner2Products];
