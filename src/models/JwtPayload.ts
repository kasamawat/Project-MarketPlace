export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  storeId?: string;
  // เพิ่ม fields ตาม JWT ของคุณ
}