export type Product = {
  id: number;
  name: string;
  category: string;
  type: string; // <-- เพิ่ม type
  image: string;
  price: number;
};


export async function getFashionProducts(): Promise<Product[]> {
  return [
    {
      id: 1,
      name: "T-Shirt - White",
      category: "Fashion",
      type: "T-Shirt",
      image: "/images/fashion1.jpg",
      price: 19.99,
    },
    {
      id: 2,
      name: "Denim Jacket",
      category: "Fashion",
      type: "Jacket",
      image: "/images/fashion2.jpg",
      price: 49.99,
    },
    // เพิ่มได้ตามต้องการ
  ];
}

export async function getElectronicsProducts(): Promise<Product[]> {
  return [
    {
      id: 1,
      name: "Smartphone - Model X",
      category: "Electronics",
      type: "Smartphone",
      image: "/images/electronics1.jpg",
      price: 699.99,
    },
    {
      id: 2,
      name: "Laptop - Model Y",
      category: "Electronics",
      type: "Laptop",
      image: "/images/electronics2.jpg",
      price: 1299.99,
    },
    // เพิ่มได้ตามต้องการ
  ];
}

// src/lib/products.ts

export async function getFurnitureProducts(): Promise<Product[]> {
  return [
    {
      id: 1,
      name: "Wooden Chair",
      category: "Furniture",
      type: "Chair",
      image: "/images/furniture1.jpg",
      price: 39.99,
    },
    {
      id: 2,
      name: "Modern Sofa",
      category: "Furniture",
      type: "Sofa",
      image: "/images/furniture2.jpg",
      price: 299.99,
    },
    {
      id: 3,
      name: "Bookshelf",
      category: "Furniture",
      type: "Bookshelf",
      image: "/images/furniture3.jpg",
      price: 79.99,
    },
    {
      id: 4,
      name: "Dining Table",
      category: "Furniture",
      type: "Table",
      image: "/images/furniture4.jpg",
      price: 249.99,
    },
  ];
}