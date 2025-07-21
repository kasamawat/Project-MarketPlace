import { Product, ProductType } from "../types/product.types";

export const furnitureProducts: Product[] = [
    {
        id: 1,
        name: "Wooden Chair",
        type: ProductType.Furniture,
        category: "Chair",
        image: "/images/furniture1.jpg",
        price: 39.99,
    },
    {
        id: 2,
        name: "Modern Sofa",
        type: ProductType.Furniture,
        category: "Sofa",
        image: "/images/furniture2.jpg",
        price: 299.99,
    },
    {
        id: 3,
        name: "Bookshelf",
        type: ProductType.Furniture,
        category: "Bookshelf",
        image: "/images/furniture3.jpg",
        price: 79.99,
    },
    {
        id: 4,
        name: "Dining Table",
        type: ProductType.Furniture,
        category: "Table",
        image: "/images/furniture4.jpg",
        price: 249.99,
    },
];