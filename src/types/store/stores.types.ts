type ImageItemDto = {
  _id: string;
  role: string;
  order: number;
  publicId: string;
  version?: number;
  width?: number;
  height?: number;
  format?: string;
  url?: string; // ถ้าเก็บไว้
};


export type StorePubilc = {
  _id: string,
  name: string,
  logoUrl?: string,
  // coverUrl?: string,
  slug?: string,
  description?: string,
  phone?: string,
  logo?: ImageItemDto,
  followersCount?: number,
  rating?: number,
}

export type StoreSecure = StorePubilc & {
  bankName?: string,
  bankAccountNumber?: string,
  bankAccountName?: string,
  returnPolicy?: string,
  status: "approved" | "pending" | "rejected",
  createdAt: string,
}