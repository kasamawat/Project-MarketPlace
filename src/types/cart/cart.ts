import { PublicProduct, SkuPublic } from "../product/products.types";

// types/cart.ts
export type CartSkuRef = {
    itemId: string; // ใช้เป็น skuId
    skuId: string;
    attributes: Record<string, string>; // เช่น { Color: "Red", Size: "S" } หรือ {}
    price: number;                      // ราคาต่อหน่วยที่ใช้คิดเงิน
    available?: number;                 // คงเหลือ ณ ตอนใส่ (optional, ใช้ clamp ฝั่ง FE)
    image?: string;
    purchasable?: boolean;
};

interface CartImageDto {
  _id: string;
  role: string;
  order: number;
  publicId: string;
  version?: number;
  width?: number;
  height?: number;
  format?: string;
  url?: string;
}

export type CartItem = {
    productId: string;
    productName: string;
    productImage?: string;
    store?: { id?: string; slug?: string; name?: string }; // เผื่อทำ split ตามร้าน
    sku: CartSkuRef;
    quantity: number;          // จำนวนในตะกร้า
    subtotal: number;          // = price * quantity (คำนวณทุกรอบ)
    cover: CartImageDto;
};

export type AddToCartArgs = {
    product: PublicProduct;
    sku: SkuPublic;
    quantity?: number;
};
