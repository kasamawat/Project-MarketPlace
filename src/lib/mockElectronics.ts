import { Product, ProductType } from "../types/product.types";

export const electronicsProducts: Product[] = [
    {
        id: 1,
        name: "Smartphone - Model X",
        type: ProductType.Electronics,
        category: "Smartphone",
        image: "/images/electronics1.jpg",
        price: 699.99,
    },
    {
        id: 2,
        name: "Laptop - Model Y",
        type: ProductType.Electronics,
        category: "Laptop",
        image: "/images/electronics2.jpg",
        price: 1299.99,
    },
];