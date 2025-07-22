// components/Navbar/NavbarCart.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import Image from "next/image";

const NavbarCart: React.FC = () => {
  const { cartItems, removeFromCart } = useCart();

  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const totalItems = cartItems.length;
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const pathname = usePathname();

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-8">
      {/* Cart */}
      <div className="relative">
        <div
          ref={triggerRef}
          className="cursor-pointer"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0"
              stroke="#615fff"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 text-xs bg-indigo-500 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>

        {/* Dropdown */}
        {isCartOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-9 w-92 bg-gray-900 shadow-lg rounded-lg p-4 z-50"
          >
            <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
              {cartItems.map((item) => (
                <li key={item.id} className="py-2 text-sm flex justify-between">
                  <div className="grid grid-cols-5 flex items-center gap-2">
                    <div className="p-2 col-span-2 justify-center">
                      <Link href={`/products/${item.id}`}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="w-25 h-28 object-cover rounded-md shadow rounded border-1 border-solid border-gray-600"
                        />
                      </Link>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-semibold">
                        {(item.price * item.quantity).toFixed(2)}฿
                      </p>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        className="h-full text-sm text-white hover:text-gray-700 cursor-pointer bg-red-500 border-circles rounded-full p-1"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M4 7l16 0" />
                          <path d="M10 11l0 6" />
                          <path d="M14 11l0 6" />
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {cartItems.length > 0 ? (
              <div className="border-t mt-3 pt-3">
                <p className="text-sm text-white mb-2">
                  Total:{" "}
                  <span className="font-bold text-white">
                    {totalPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    ฿
                  </span>
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/cart"
                    className="w-1/2 text-center py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-800 cursor-pointer"
                  >
                    View Cart
                  </Link>
                  <button className="w-1/2 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded text-white cursor-pointer">
                    Checkout
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-center text-white mb-2">
                  No items added to cart
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarCart;
