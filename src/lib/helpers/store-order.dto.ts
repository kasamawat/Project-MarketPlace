export type fulfillmentStatus = | "UNFULFILLED"
  | "PARTIALLY_FULFILLED"
  | "FULFILLED"
  | "CANCELED"
  | "RETURNED";

export type SellerOrderListItem = {
  storeOrderId: string;
  createdAt: string;
  itemsPreview: {
    name: string;
    qty: number;
    attributes?: Record<string, string>;
  }[];
  itemsCount: number;
  itemsTotal: number;
  currency: string;
  status:
  | "pending_payment"
  | "paying"
  | "processing"
  | "paid"
  | "canceled"
  | "expired";
  fulfillment: {
    status: fulfillmentStatus;
    shippedItems: number;
    deliveredItems: number;
    totalItems: number;
  }
  buyer?: { username?: string; email?: string };
};
