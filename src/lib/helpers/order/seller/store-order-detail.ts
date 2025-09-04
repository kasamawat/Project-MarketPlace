import { MasterStatus, StoreStatus } from "../order-base.types";

// --- Types (adjust to your real DTOs) ---
interface BuyerLite {
    _id: string;
    username: string;
    email?: string;
    phone?: string;
}

export interface AddressInfo {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    district?: string; // อำเภอ/เขต
    subDistrict?: string; // ตำบล/แขวง
    province?: string;
    postalCode?: string;
    country?: string;
    note?: string;
}

interface PaymentInfoLite {
    method: "COD" | "CARD" | "TRANSFER" | "PROMPTPAY" | "WALLET" | string;
    amount: number;
    fee?: number;
    currency?: string; // THB
    paidAt?: string | Date | null;
    intentId?: string; // stripe intent id หรือ reference
    status?: "pending" | "paid" | "failed" | "refunded" | string;
}

interface FulfillTimelineItem {
    type: string;
    at: Date;
    by?: string;
    payload?: Record<string, unknown>;
}

export type FulfillmentPackage = {
    _id: string;
    code?: string;
    boxType?: string;
    weightKg?: number;
    dimension?: { l?: number; w?: number; h?: number };
    note?: string;
    items: {
        productId: string;
        skuId: string; 
        qty: number;
        attributes: Record<string, string>;
        productName?: string
    }[];
    createdAt: string;

    shipmentId: string;
    shippedAt: string;
};

export type FulfillmentShipment = {
    _id: string;
    carrier: string;
    trackingNumber: string;
    method?: "DROP_OFF" | "PICKUP";
    shippedAt?: string;
    packageIds: string[];
    note?: string;
    createdAt: string;
};

interface FulfillmentInfo {
    status:
    | "UNFULFILLED"
    | "PARTIALLY_FULFILLED"
    | "FULFILLED"
    | "CANCELED"
    | "RETURNED";
    shippedItems?: number;
    deliveredItems?: number;
    totalItems?: number;
    timeline?: FulfillTimelineItem[];

    packages?: FulfillmentPackage[];
    shipments?: FulfillmentShipment[];
}

export interface StoreOrderItemLite {
    productId: string;
    skuId?: string;
    name: string; // ชื่อสินค้าที่เวลาสั่งซื้อ
    attributes: Record<string, string>;
    imageUrl?: string;
    quantity: number;
    price: number; // ราคาต่อชิ้น ณ เวลาสั่ง
    subtotal: number; // price * quantity (หลังส่วนลดของ item)
    fulfillStatus?: "PENDING" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELED";

    // ตัวนับสำหรับ partial fulfill
    packedQty?: number;
    shippedQty?: number;
    deliveredQty?: number;
    canceledQty?: number;
}

export interface StoreOrderDetail {
    storeOrderId: string;
    // code: string; // รหัสคำสั่งซื้อฝั่งร้าน เช่น STO-XXXX
    masterOrderId?: string;
    storeId: string;
    storeStatus: StoreStatus
    buyerStatus?: MasterStatus
    buyer: BuyerLite;
    shippingAddress?: AddressInfo;
    billingAddress?: AddressInfo;
    itemsPreview: StoreOrderItemLite[];
    discount?: number;
    shippingFee?: number;
    otherFee?: number;
    itemsCount: number;
    itemsTotal: number;
    payment?: PaymentInfoLite;
    fulfillment?: FulfillmentInfo;
    createdAt: string | Date;
    updatedAt: string | Date;
}


// ====================== TYPE ======================
export type PACKAGE_TYPE = {
    boxType: string;
    weightKg: string;
    l: string;
    w: string;
    h: string;
    note: string;
};

export type METHOD_TYPE = "DROP_OFF" | "PICKUP";

export type SHIPMENT_TYPE = {
    carrier: string;
    trackingNumber: string;
    method: METHOD_TYPE;
    shippedAt: string; // datetime-local
    note: string;
};
