// src/lib/helpers/store-order-helper.ts
export type SellerTabKey =
    | "pending"
    | "awaiting_payment"
    | "packed"
    | "shipped"
    | "delivered"
    | "canceled"
    | "expired"
    | "all";

/**
 * สร้าง QS สำหรับ /store/orders ตามแท็บ
 * - รองรับ storeStatus หลายค่า โดย append ซ้ำ (…&storeStatus=PENDING&storeStatus=PACKED)
 * - ถ้าอยากให้แท็บ ALL เห็นเฉพาะ paid ให้ set buyerStatus=paid ในเคส "all"
 */
export function buildStoreOrdersQS(tab: SellerTabKey, page = 1, limit = 10) {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("limit", String(limit));

    switch (tab) {
        case "pending": {
            qs.set("buyerStatus", "paid");
            qs.append("storeStatus", "PENDING");
            break;
        }
        case "awaiting_payment": {
            qs.set("buyerStatus", "pending_payment");
            break;
        }
        case "packed": {
            qs.set("buyerStatus", "paid");
            qs.append("storeStatus", "PACKED");
            break;
        }
        case "shipped": {
            qs.set("buyerStatus", "paid");
            qs.set("storeStatus", "SHIPPED");
            break;
        }
        case "delivered": {
            qs.set("buyerStatus", "paid");
            qs.set("storeStatus", "DELIVERED");
            break;
        }
        case "canceled": {
            qs.set("buyerStatus", "canceled");
            break;
        }
        case "expired": {
            qs.set("buyerStatus", "expired");
            break;
        }
        case "all":
        default: {
            // ไม่ใส่ filter -> ทั้งหมดของร้าน
            // ถ้าอยากให้ ALL ยังโฟกัสเฉพาะจ่ายแล้ว ให้เปิดบรรทัดล่างนี้
            // qs.set("buyerStatus", "paid");
            break;
        }
    }

    return qs.toString();
}
