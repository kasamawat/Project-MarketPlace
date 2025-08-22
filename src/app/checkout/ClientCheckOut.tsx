"use client";

import { useCart } from "@/app/context/CartContext";
import { attrsToText } from "@/lib/helpers/productList";
import { PlaceOrderForm } from "@/types/order/order.types";
import { useRouter } from "next/navigation";
import React from "react";

type PayMethod = "online" | "cod";

export default function ClientCheckOut(): React.ReactElement {
  const router = useRouter();
  const { cartItems } = useCart();

  const [method, setMethod] = React.useState<PayMethod>("online");
  // ✅ init state ให้ครบฟิลด์ (ห้ามเป็น {} เปล่า ๆ)
  const [placeOrder, setPlaceOrder] = React.useState<PlaceOrderForm>({
    fullname: "",
    phone: "",
    address: "",
    city: "",
    postCode: "",
  });

  // ✅ handler กลาง
  function handleChange<K extends keyof PlaceOrderForm>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setPlaceOrder((prev) => ({ ...prev, [key]: e.target.value }));
    };
  }

  async function onProceed() {
    // 1) ยิงสร้างออเดอร์ (ไม่สร้าง Intent ตอนนี้)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          // map FE -> BE
          paymentMethod: method === "cod" ? "cod" : "card", // ใช้ "card" แทน "online"
          shippingAddress: placeOrder,
        }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const { orderId } = await res.json(); // toClient(order) ต้องคืน orderId ด้วย

    // 2) ไปหน้าชำระเงิน
    router.push(`/checkout/pay?orderId=${encodeURIComponent(orderId)}`);
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.sku.price * item.quantity,
    0
  );

  const isFormValid =
    placeOrder.fullname &&
    placeOrder.phone &&
    placeOrder.address &&
    placeOrder.city &&
    placeOrder.postCode;

  return (
    <div className="grid grid-cols-5 flex-col md:flex-row gap-6 h-full">
      {/* Left: Billing + Payment method */}
      <div className="col-span-3 mt-5">
        <h1 className="text-xl font-bold">Billing Details</h1>

        <div className="space-y-6 mt-5">
          {/* Shipping Info */}
          <div className="border p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Shipping Information</h2>
            <form className="space-y-3">
              <input
                className="w-full border p-2"
                placeholder="Full Name"
                name="fullname"
                value={placeOrder.fullname}
                onChange={handleChange("fullname")}
                autoComplete="name"
                required
              />
              <input
                className="w-full border p-2"
                placeholder="Phone Number"
                name="phone"
                type="tel"
                value={placeOrder.phone}
                onChange={handleChange("phone")}
                autoComplete="tel"
                required
              />
              <input
                className="w-full border p-2"
                placeholder="Address"
                name="address"
                value={placeOrder.address}
                onChange={handleChange("address")}
                autoComplete="street-address"
                required
              />
              <input
                className="w-full border p-2"
                placeholder="City"
                name="city"
                value={placeOrder.city}
                onChange={handleChange("city")}
                required
              />
              <input
                className="w-full border p-2"
                placeholder="Postal Code"
                name="postCode"
                value={placeOrder.postCode}
                onChange={handleChange("postCode")}
                inputMode="numeric"
                autoComplete="postal-code"
                required
              />
            </form>
          </div>

          {/* Payment Method */}
          <div className="border p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment"
                  checked={method === "online"}
                  onChange={() => setMethod("online")}
                />
                Online (Cards / PromptPay)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment"
                  checked={method === "cod"}
                  onChange={() => setMethod("cod")}
                />
                COD (เก็บเงินปลายทาง)
              </label>
            </div>

            {/* ⬇️ ฝัง PaymentPanel ไว้ตรงนี้เลย (ถ้าไม่ใช่ COD) */}
            {method !== "cod" && (
              <button
                disabled={!isFormValid || total <= 0}
                className={`w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 ${
                  isFormValid ? "cursor-pointer hover:bg-blue-700" : ""
                }`}
                onClick={onProceed}
              >
                เริ่มชำระเงิน (ไปหน้าชำระเงิน)
              </button>
            )}
            {method === "cod" && (
              <button
                className="w-full bg-gray-600 text-white py-2 rounded-lg"
                disabled={!isFormValid}
              >
                ยืนยันสั่งซื้อแบบเก็บเงินปลายทาง
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Order summary */}
      <div className="col-span-2 mt-5">
        <h1 className="text-xl font-bold">Your order</h1>
        <div className="space-y-6 mt-5">
          <div className="border p-4 rounded-lg shadow-sm bg-gray-800">
            <ul className="grid grid-cols-4 border-b-1 pt-4 pb-4 mr-4 ml-4 font-bold">
              <div className="col-span-1 text-center">Product</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-1 text-center">Unit Price</div>
              <div className="col-span-1 text-right">Total</div>
            </ul>

            {cartItems.map((item, index) => (
              <li
                key={`${item.productId}::${item.sku.itemId}`}
                className={`grid grid-cols-4 ${
                  cartItems.length === index + 1 ? "border-b-1 pb-4" : ""
                } pt-2 pb-2 mr-4 ml-4 text-sm`}
              >
                <span className="col-span-1 text-center">
                  {item.productName} {attrsToText(item.sku.attributes)}
                </span>
                <span className="col-span-1 text-center">{item.quantity}</span>
                <span className="col-span-1 text-center">
                  ฿ {item.sku.price}
                </span>
                <span className="col-span-1 text-right">
                  ฿ {item.sku.price * item.quantity}
                </span>
              </li>
            ))}

            <div className="grid grid-cols-2 border-b-1 pt-4 pb-4 mr-4 ml-4 mb-8 font-bold">
              <span className="col-span-1 text-left">Total</span>
              <span className="col-span-1 text-right text-green-500">
                ฿ {total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
