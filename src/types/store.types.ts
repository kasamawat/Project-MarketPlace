export type Store = {
    id: string | number;                 // UUID
    name: string;
    description?: string;
    image?: string;
    bannerUrl?: string;
    ownerId: string;            // userId ของเจ้าของร้าน
    createdAt?: Date;
}