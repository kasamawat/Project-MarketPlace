import { BuyerStatus, MasterOrderView, StoreOrderView } from "@/types/order/buyer/order.buyer.types";

function summarizeFulfillment(orders: StoreOrderView[]) {
    let hasShipped = false;
    let allDelivered = true;

    for (const so of orders) {
        for (const it of so.items) {
            if (it.fulfillStatus === "SHIPPED") hasShipped = true;
            // ยังไม่ถือว่าส่งสำเร็จทั้งหมด ถ้าเจอไม่ใช่ DELIVERED/RETURNED/CANCELED
            if (!["DELIVERED"].includes(it.fulfillStatus)) {
                allDelivered = false;
            }
        }
    }
    return { hasShipped, allDelivered };
}

// =================================================================================================================
// ================================================= Main Function =================================================
// =================================================================================================================

export function computeUserStatus(
    master: MasterOrderView,
    stores: StoreOrderView[],
): BuyerStatus {
    // 1) เคสจบสิ้นก่อน (จองหมดอายุ/ยกเลิก)
    if (master.status === "expired") return "expired";
    if (master.status === "canceled") return "canceled";

    // 2) ระยะจ่ายเงิน (ก่อนเปลี่ยนเป็น paid)
    if (master.status === "pending_payment") {
        const ps = master.payment?.status;
        if (ps === "requires_action") return "paying";    // ต้องทำ 3DS/authorize
        if (ps === "processing") return "processing";     // PSP กำลังประมวลผล
        return "pending_payment";                         // ยังไม่ได้เริ่มยืนยัน
    }

    // 3) หลังจ่ายสำเร็จ → ดูฝั่งจัดส่ง
    // (ถึงแม้ master = paid แล้ว อาจยังไม่ส่ง)
    if (master.status === "paid") {
        const { hasShipped, allDelivered } = summarizeFulfillment(stores);

        if (allDelivered && stores.length > 0) return "delivered";
        if (hasShipped) return "shipped";
        return "paid";
    }

    // fallback ปลอดภัย (ไม่ควรมาถึง)
    return master.status as BuyerStatus;
}
