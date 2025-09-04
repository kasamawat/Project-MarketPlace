import { MasterStatus, StoreStatus } from "./order/order-base.types";

/* ===== Input types from aggregation ===== */
export type FulfillStatus =
  | "AWAITING_PAYMENT"
  | "PENDING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "RETURNED";

type StoreOrderItemView = {
  productId: string;
  skuId: string;
  productName: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  fulfillStatus: FulfillStatus;
  attributes?: Record<string, string>;
};

type Address = {
  line1?: string;
  line2?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string; // 'TH'
}

type Contact = {
  name?: string;
  email?: string;
  phone?: string;
}

type ShippingInfo = {
  method?: string,
  address?: Address,
  contact?: Contact;
};

type TimelineItem = {
  type: string,
  at: Date,
  by?: string,
  payload?: Record<string, unknown>,
}

/* ===== Output DTO ===== */
type StoreOrderBriefOut = {
  storeOrderId: string;
  storeId: string;
  buyerStatus: MasterStatus;
  pricing: { itemsTotal: number; grandTotal: number };
  items: StoreOrderItemView[];
  shipping: ShippingInfo;
  timeline: TimelineItem[];
};

export type BuyerOrderDetail = {
  masterOrderId: string;
  createdAt: string;
  currency: string;
  buyerStatus: MasterStatus;
  reservationExpiresAt?: string;
  payment?: {
    provider?: string;
    method?: string;
    status?: string;
    intentId?: string;
    amount?: number;
    currency?: string;
    receiptEmail?: string;
  };
  paidAt?: string;
  paidAmount?: number;
  paidCurrency?: string;
  paymentIntentId?: string;
  pricing?: {
    itemsTotal: number;
    shippingFee: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
  };
  stores: StoreOrderBriefOut[];
};

// ================================================================================
type storesSummary = {
  storeOrderId: string;
  storeId: string;
  storeName: string;
  storeStatus: StoreStatus
  buyerStatus: MasterStatus
  itemsCount: number;
  itemsTotal: number;
  itemsPreview: {
    name: string;
    qty: number;
    image?: string;
    attributes?: Record<string, string>;
    fulfillStatus?: FulfillStatus;
  }[];
};

export type BuyerOrderListItem = {
  masterOrderId: string;
  createdAt: string;
  itemsPreview: {
    name: string;
    qty: number;
    image?: string;
    attributes: Record<string, string>;
  }[];
  itemsCount: number;
  itemsTotal: number;
  currency: string;
  buyerStatus: MasterStatus;
  reservationExpiresAt?: string;
  storesSummary: storesSummary[];
}