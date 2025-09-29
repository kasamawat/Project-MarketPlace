import { ImageItemDto } from "@/types/product/products.types";
import { MasterStatus, StoreStatus } from "./order/order-base.types";

export type fulfillmentStatus = | "UNFULFILLED"
  | "PARTIALLY_FULFILLED"
  | "FULFILLED"
  | "CANCELED"
  | "RETURNED";

// Use for list sellter order
export type SellerOrderListItem = {
  storeOrderId: string;
  createdAt: string;
  itemsPreview: {
    name: string;
    qty: number;
    attributes?: Record<string, string>;
    cover: ImageItemDto; 
  }[];
  itemsCount: number;
  itemsTotal: number;
  currency: string;
  buyerStatus: MasterStatus
  storeStatus: StoreStatus
  fulfillment: {
    status: fulfillmentStatus;
    shippedItems: number;
    deliveredItems: number;
    totalItems: number;
  }
  buyer?: { username?: string; email?: string };
};