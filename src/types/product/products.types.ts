/** ─────────────────────────────────────────────────────────
 *  Status
 *  ───────────────────────────────────────────────────────── */
export const PRODUCT_STATUSES = [
  "draft",
  "pending",
  "published",
  "unpublished",
  "rejected",
] as const;
export type ProductStatus = typeof PRODUCT_STATUSES[number];

/** ─────────────────────────────────────────────────────────
 *  SKU types
 *  ───────────────────────────────────────────────────────── */
export type SkuBase = {
  skuCode?: string;
  attributes: Record<string, string>; // {} = base
  price?: number;                     // ถ้าไม่ใส่ ใช้ defaultPrice
  image?: string;
  purchasable?: boolean;              // default = true
  onHand?: number;
  reserved?: number;
  available?: number; // ถ้า BE ไม่ส่งมา จะคำนวณใน FE ก็ได้
};

export type SkuRow = SkuInput & { _id?: string }; // _id มีเฉพาะของเดิม
export type SkuInput = SkuBase;       // สำหรับ POST/PUT เฉพาะ SKU
// export type Sku = SkuBase & { _id: string };

/** ─────────────────────────────────────────────────────────
 *  For Store
 *  ───────────────────────────────────────────────────────── */

/** ─────────────────────────────────────────────────────────
 *  Product list item
 *  ───────────────────────────────────────────────────────── */
export type ProductListItem = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  image?: string;
  defaultPrice?: number;
  status: ProductStatus;
  // optional fields ที่บาง endpoint อาจส่งมา
  skuCount?: number;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

/** ─────────────────────────────────────────────────────────
 *  Product detail (API response)
 *  ───────────────────────────────────────────────────────── */
export type ProductDetailResponse = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  image?: string;
  defaultPrice?: number;
  status: ProductStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

/** ─────────────────────────────────────────────────────────
 *  Editor state (ใช้ในหน้า create/edit)
 *  ───────────────────────────────────────────────────────── */
export type ProductEditorState = {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  type: string;
  defaultPrice?: number;
  status: ProductStatus;
  skus: SkuRow[]; // explicit SKUs
};

/** ─────────────────────────────────────────────────────────
 *  Form (tab รายละเอียดสินค้า) — ใช้ใน UI เท่านั้น
 *  ───────────────────────────────────────────────────────── */
export type ProductDetailFormInput = {
  name: string;
  description?: string;
  image?: string;
  // ใส่ "" ได้สำหรับ select ที่ยังไม่เลือก
  category: string | "";
  type: string | "";
  defaultPrice?: number;
  status?: ProductStatus;
};

/** ─────────────────────────────────────────────────────────
 *  Manage tab props (UI)
 *  ───────────────────────────────────────────────────────── */
export type ManageProductFormInput = {
  skus: SkuRow[];
  defaultPrice?: number;
  productName?: string; // ช่วย autogen sku code
};

/** ─────────────────────────────────────────────────────────
 *  Payloads
 *  ───────────────────────────────────────────────────────── */
export type CreateProductPayload = {
  name: string;
  description?: string;
  category: string;
  type: string;
  image?: string;
  defaultPrice?: number; // fallback ให้ SKU
  status?: ProductStatus;
  skus: SkuInput[];
};

export type UpdateProductPayload = {
  name?: string;
  description?: string;
  image?: string;
  category?: string;
  type?: string;
  defaultPrice?: number;
  status?: ProductStatus;
};

/** ─────────────────────────────────────────────────────────
 *  For Public
 *  ───────────────────────────────────────────────────────── */
/** ─────────────────────────────────────────────────────────
 *  Product Public list item
 *  ───────────────────────────────────────────────────────── */
// types/products-public.ts
export type PublicProductListQuery = {
  q?: string;
  category?: string;
  sort?: "new" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
};

export type PublicProduct = {
  _id: string;
  name: string;
  image?: string;
  description?: string;

  // ราคาสำหรับโชว์การ์ด
  priceFrom?: number;         // ราคาต่ำสุด (จาก SKUs หรือ defaultPrice)
  priceTo?: number;           // ราคาสูงสุด (ถ้าเท่ากับ priceFrom ให้ omit)

  skuCount: number;           // จำนวนตัวเลือกที่ซื้อได้ (purchasable SKUs)
  // (ออปชัน) ป้ายร้าน
  store?: { _id: string; name: string; slug?: string };
};

export type PublicProductListResponse = {
  items: PublicProduct[];
  total: number;
  page: number;
  limit: number;
};

/** ─────────────────────────────────────────────────────────
 *  SKU Public types
 *  ───────────────────────────────────────────────────────── */
export type SkuPublic = {
  _id: string;
  attributes: Record<string, string>; // {} = base SKU
  price?: number;
  image?: string;
  purchasable?: boolean;
  available?: number; // ถ้า BE ส่งมา
};