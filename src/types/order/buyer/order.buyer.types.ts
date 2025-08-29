// ===== Types (ย่อให้พอใช้งาน) =====
export type PayCoreStatus = "pending_payment" | "paid" | "canceled" | "expired";
export type PayDetailStatus =
    | "requires_action"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled";

export type FulfillItemStatus =
    | "AWAITING_PAYMENT"
    | "PENDING"
    | "PACKED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELED"
    | "RETURNED";

export type BuyerStatus =
    | "pending_payment" // ยังไม่จ่าย/ต้องทำแอ็กชัน
    | "paying"          // อยู่ในขั้นตอนยืนยัน (3DS/PromptPay)
    | "processing"      // จ่ายแล้ว ระบบกำลังตรวจสอบ
    | "paid"            // จ่ายแล้ว รอร้านเตรียมของ
    | "shipped"         // มีอย่างน้อยหนึ่งร้านส่งของแล้ว
    | "delivered"       // ทุกชิ้นส่งสำเร็จ
    | "canceled"        // ยกเลิก
    | "expired";        // หมดอายุ

export interface MasterOrderView {
    status: PayCoreStatus;
    payment?: { status?: PayDetailStatus | null } | null;
}

export interface StoreOrderView {
    status: PayCoreStatus; // ปกติจะ sync กับ master (ก่อนชำระ)
    items: Array<{ fulfillStatus: FulfillItemStatus }>;
}
