export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  storeId?: string;
}