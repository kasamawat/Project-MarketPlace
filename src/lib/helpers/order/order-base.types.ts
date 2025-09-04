export type MasterStatus = | "pending_payment"
    | "paid"
    | "canceled"
    | "expired"
    | "refunded"; // status สำหรับ buyer

export type StoreStatus = | "PENDING"
    | "PACKED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELD"
    | "RETURNED"; // status สำหรับ seller