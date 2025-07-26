"use client";

import CartSummary from "./components/CartSummary";
import ShippingForm from "./components/ShippingForm";
import PaymentMethods from "./components/PaymentMethods";
import OrderSummary from "./components/OrderSummary";
import { useCart } from "@/app/context/CartContext";

export default function ClientCheckOut() {
  const { cartItems } = useCart();

  return (
    <div className="grid grid-cols-5 flex flex-col md:flex-row gap-6 h-full">
      <div className="col-span-3 mt-5">
        <h1 className="text-xl font-bold">Billing Details</h1>
        <div className="space-y-6 mt-5">
          <ShippingForm />
          <PaymentMethods />
        </div>
      </div>
      <div className="col-span-2 mt-5">
        <h1 className="text-xl font-bold">Your order</h1>
        <div className="space-y-6 mt-5">
          <CartSummary cartItem={cartItems} />
          <OrderSummary cartItem={cartItems} />
        </div>
      </div>
    </div>
  );
}
