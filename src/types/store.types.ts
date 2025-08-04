export type StoreStatus = "pending" | "approved" | "rejected";

export type Store = {
    _id: string; // หรือใช้ `_id: string;` แล้วแต่ฝั่ง backend ใช้แบบไหน (ถ้าใช้ MongoDB ก็จะเป็น `_id`)
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    phone?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    productCategory?: string;
    returnPolicy?: string;
    ownerId: string;
    status: StoreStatus;
    createdAt: Date;
};
