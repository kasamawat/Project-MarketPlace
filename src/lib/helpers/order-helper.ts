import { PlaceOrderDto, PlaceOrderForm } from "@/types/order/order.types";

// แปลงจากฟอร์ม + วิธีจ่าย (จาก UI) เป็น DTO สำหรับ BE
export function toPlaceOrderDto(
  form: PlaceOrderForm,
  feMethod: "online" | "cod" | "promptpay-only" = "online"
): PlaceOrderDto {
  // map: online -> "card" (ให้ Payment Element แสดง card/PromptPay)
  const pm: PlaceOrderDto["paymentMethod"] =
    feMethod === "cod" ? "cod" : feMethod === "promptpay-only" ? "promptpay" : "card";

  return {
    note: form.note,
    paymentMethod: pm,
    shippingAddress: {
      fullName: form.fullname,
      phone: form.phone,
      line1: form.address,
      city: form.city,
      postalCode: form.postCode,
    },
  };
}