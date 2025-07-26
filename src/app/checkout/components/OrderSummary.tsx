import { Product } from "@/types/product/product.types";

type CartItem = Product & { quantity: number };

export default function OrderSummary({ cartItem }: { cartItem: CartItem[] }) {
  const total = cartItem.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
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
  );
}
