import { Product, ProductType } from "../types/product.types";

export const fashionProducts: Product[] = [
    {
        id: 1,
        name: "T-Shirt - White",
        type: ProductType.Fashion,
        category: "T-Shirt",
        image: "/images/fashion1.jpg",
        price: 19.99,
    },
    {
        id: 2,
        name: "Denim Jacket",
        type: ProductType.Fashion,
        category: "Jacket",
        image: "/images/fashion2.jpg",
        price: 49.99,
    },
];
