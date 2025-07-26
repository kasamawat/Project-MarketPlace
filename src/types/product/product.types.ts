import { Smartphone } from "./smartphone.types";
import { FashionProduct } from "./fashion.types";

/**
 * Union type ของสินค้าทั้งหมดในระบบ
 */

export type Product = Smartphone | FashionProduct;
