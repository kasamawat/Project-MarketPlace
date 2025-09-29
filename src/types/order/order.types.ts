export type FulfillmentStatus = "PENDING" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELED";

// FE-side type ที่แม็ปกับ BE DTO
export type PlaceOrderDto = {
  note?: string;
  paymentMethod: "card" | "promptpay" | "cod";
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    line1?: string;
    city?: string;
    postalCode?: string;
    // เพิ่ม key อื่นได้ตามต้องการ เพราะ BE รับ Record<string,string>
  };
};

// ฟอร์มของคุณเดิม
export type PlaceOrderForm = {
  fullname: string;
  phone: string;
  address: string;
  city: string;
  postCode: string;
  note?: string;
};
