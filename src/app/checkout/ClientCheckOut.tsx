"use client";

import { useCart } from "@/app/context/CartContext";
import { attrsToText } from "@/lib/helpers/productList";

export default function ClientCheckOut() {
  const { cartItems } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.sku.price * item.quantity,
    0
  );

  return (
    <div className="grid grid-cols-5 flex-col md:flex-row gap-6 h-full">
      <div className="col-span-3 mt-5">
        <h1 className="text-xl font-bold">Billing Details</h1>
        <div className="space-y-6 mt-5">
          <div className="border p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Shipping Information</h2>
            <form className="space-y-3">
              <input className="w-full border p-2" placeholder="Full Name" />
              <input className="w-full border p-2" placeholder="Phone Number" />
              <input className="w-full border p-2" placeholder="Address" />
              <input className="w-full border p-2" placeholder="City" />
              <input className="w-full border p-2" placeholder="Postal Code" />
            </form>
          </div>
          <div className="border p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" defaultChecked />
                Credit/Debit Card
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" />
                PromptPay / QR Code
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="payment" />
                COD (เก็บเงินปลายทาง)
              </label>
            </div>
          </div>
        </div>
      </div>
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
          <div className="rounded-lg shadow-sm">
            {/* <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>฿{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>฿{shipping}</span>
              </div>
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>฿{total}</span>
              </div> */}
            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
