const SELLER_TABS = [
    { key: "pending", label: "ยังไม่ได้จัดส่ง" }, // = PENDING,PACKED
    { key: "awaiting_payment", label: "รอชำระ" },
    { key: "shipped", label: "ส่งแล้ว" },
    { key: "delivered", label: "ถึงผู้ซื้อ" },
    { key: "canceled", label: "ยกเลิก" },
    { key: "expired", label: "หมดอายุ" },
    { key: "all", label: "ทั้งหมด" },
] as const;

type SellerTabKey = (typeof SELLER_TABS)[number]["key"];

export function buildStoreOrdersQS(tab: SellerTabKey, page: number) {
    const p = new URLSearchParams({ page: String(page), limit: "10" });

    switch (tab) {
        case "pending":
            p.set("payStatus", "paid,processing");     // จ่ายแล้ว/กำลังตรวจสอบ
            p.set("fulfillStatus", "PENDING");  // รอจัดส่ง
            break;

        case "awaiting_payment": // รอจ่ายเงิน
            p.set("payStatus", "pending_payment");
            break;

        case "shipped": // ส่งแล้ว
            p.set("fulfillStatus", "SHIPPED");
            break;

        case "delivered": // ถึงผู้ซื้อแล้ว
            p.set("fulfillStatus", "DELIVERED");
            break;

        case "canceled": // ยกเลิก
            p.set("payStatus", "canceled");
            p.set("fulfillStatus", "CANCELED,RETURNED");
            break;

        case "expired": // หมดอายุ
            p.set("payStatus", "expired");
            break;

        case "all": // ทั้งหมด
        default:
            break;
    }
    return p.toString();
}
