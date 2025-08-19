export type StorePubilc = {
    _id: string,
    name: string,
    logoUrl?: string,
    coverUrl?: string,
    slug?: string,
    description?: string,
    phone?: string,
}

export type StoreSecure = StorePubilc & {
    bankName?: string,
    bankAccountNumber?: string,
    bankAccountName?: string,
    returnPolicy?: string,
    status: "approved" | "pending" | "rejected",
    createdAt: string,
}