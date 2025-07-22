"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";

export default function ClientCart() {
  //   const [cart, setCart] = useState<CartItem[]>([]);
  const { cartItems, removeFromCart, addToCart, clearCart } = useCart();

  useEffect(() => {
    // โหลด cart จาก localStorage หรือ context
    // const stored = localStorage.getItem("cart");
    // if (stored) {
    //   setCart(JSON.parse(stored));
    // }
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-white">No items found in cart</p>
          <Link
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
            href="/products"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <>
          <h1 className="flex text-2xl font-bold mb-4 text-white">
            Your cart items
          </h1>
          <div className="grid grid-cols-6 gap-4 text-center border border-gray-600 p-4">
            <div className="col-span-1">
              <h2 className="text-white font-medium">IMAGE</h2>
            </div>
            <div className="col-span-1">
              <h2 className="text-white font-medium">PRODUCT NAME</h2>
            </div>
            <div className="col-span-1">
              <h2 className="text-white font-medium">UNIT PRICE</h2>
            </div>
            <div className="col-span-1">
              <h2 className="text-white font-medium">QTY</h2>
            </div>
            <div className="col-span-1">
              <h2 className="text-white font-medium">SUBTOTAL</h2>
            </div>
            <div className="col-span-1">
              <h2 className="text-white font-medium">ACTION</h2>
            </div>
          </div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-6 gap-4 text-center border border-gray-600 p-4"
            >
              <Link
                href={`/products/${item.id}`}
                className="col-span-1 flex items-center justify-center"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={800}
                  height={600}
                  className="w-40 h-50 object-cover rounded mr-4 ml-4 mt-2 mb-2 border-1 border-solid border-gray-600"
                />
              </Link>
              <div className="col-span-1 flex items-center justify-center">
                <h2 className="text-white font-medium">{item.name}</h2>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <p className="text-gray-400 text-sm">
                  ฿
                  {item.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <div className="flex items-center justify-center border border-gray-600 rounded py-2">
                  <button
                    className="text-lg font-bold text-white px-3 cursor-pointer"
                    onClick={() => addToCart(item, -1)}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={item.quantity}
                    className="w-10 text-center bg-transparent text-white outline-none"
                    disabled
                  />
                  <button
                    className="text-lg font-bold text-white px-3 cursor-pointer"
                    onClick={() => addToCart(item, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <p className="text-green-400 text-sm">
                  ฿
                  {(item.quantity * item.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <button
                  className="text-red-500 hover:text-red-700 border border-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    removeFromCart(item.id);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center mt-10 mb-10">
            <Link
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded transition-colors duration-300"
              href="/products"
            >
              CONTINUE SHOPING
            </Link>
            <button
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded transition-colors duration-300 cursor-pointer"
              onClick={() => clearCart()}
            >
              CLEAR SHOPPING CART
            </button>
          </div>
        </>
      )}

      {cartItems.length > 0 && (
        <div className="grid grid-cols-3">
          <div className="col-span-1 bg-gray-800 m-3 p-6">
            <h1 className="text-lg font-bold text-white mb-6">
              Estimate Shipping And Tax
            </h1>
            <p className="text-sm">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum
              porro laborum atque dolorem nostrum, optio minima fuga eum libero
              quam necessitatibus blanditiis, nemo nobis temporibus a expedita
              dolorum illo ratione.
            </p>
          </div>
          <div className="col-span-1 bg-gray-800 m-3 p-6">
            <h1 className="text-lg font-bold text-white mb-6">
              Use Coupon Code
            </h1>
            <p className="text-sm">Enter Your Code</p>
          </div>
          <div className="col-span-1 bg-gray-800 m-3 p-6">
            <h1 className="text-lg font-bold text-white mb-6">Cart Total</h1>
            <div className="flex justify-between">
              <p className="text-lg text-green-500 font-semibold">
                Total products
              </p>
              <p className="text-lg text-green-500 font-semibold">
                ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
