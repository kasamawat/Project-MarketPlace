"use client";

// import { useCart } from "@/hooks/useCart"; // สมมุติว่ามี useCart()
import { Product } from "@/types/product/product.types";

type CartItem = Product & { quantity: number };

export default function CartSummary({ cartItem }: { cartItem: CartItem[] }) {
  const total = cartItem.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-gray-800">
      <ul className="grid grid-cols-2 border-b-1 pt-4 pb-4 mr-4 ml-4 font-bold">
        <div className="col-span-1 text-left">Product</div>
        <div className="col-span-1 text-right">Total</div>
      </ul>
      {cartItem.map((item, index) => (
        <li
          key={item.id}
          className={`grid grid-cols-2 ${((cartItem.length === index + 1) ? "border-b-1 pb-4" : "")} pt-2 pb-2 mr-4 ml-4 text-sm`}
        >
          <span className="col-span-1 text-left">
            {item.name} x {item.quantity}
          </span>
          <span className="col-span-1 text-right">
            ฿{item.price * item.quantity}
          </span>
        </li>
      ))}
      <div className="grid grid-cols-2 border-b-1 pt-4 pb-4 mr-4 ml-4 mb-8 font-bold">
        <span className="col-span-1 text-left">Total</span>
        <span className="col-span-1 text-right text-green-500">฿{total}</span>
      </div>
    </div>
  );
}
