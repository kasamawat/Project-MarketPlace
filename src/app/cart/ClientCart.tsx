"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { attrsToText } from "@/lib/helpers/productList";

const colNames = [
  "IMAGE",
  "PRODUCT NAME",
  "VARIATION",
  "UNIT PRICE",
  "QTY",
  "SUBTOTAL",
  "ACTION",
];

export default function ClientCart() {
  //   const [cart, setCart] = useState<CartItem[]>([]);
  const { cartItems, removeFromCart, addToCart, clearCart } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.sku.price * item.quantity,
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
          <div className="grid grid-cols-7 gap-4 text-center border border-gray-600 p-4">
            {colNames.map((item, idx) => (
              <div key={idx} className="col-span-1">
                <h2 className="text-white font-medium">{item}</h2>
              </div>
            ))}
          </div>
          {cartItems.map((item) => (
            <div
              key={`${item.productId}::${item.sku.skuId}`}
              className="grid grid-cols-7 gap-4 text-center border border-gray-600 p-4"
            >
              <Link
                href={`/products/${item.productId}`}
                className="col-span-1 flex items-center justify-center"
              >
                <Image
                  src={item.productImage || "/no-image.png"}
                  alt={item.productName}
                  width={800}
                  height={600}
                  className="w-40 h-50 object-cover rounded mr-4 ml-4 mt-2 mb-2 border-1 border-solid border-gray-600"
                />
              </Link>
              <div className="col-span-1 flex items-center justify-center">
                <h2 className="text-white font-medium">{item.productName}</h2>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <h2 className="text-white font-medium">
                  {attrsToText(item.sku.attributes)}
                </h2>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <p className="text-gray-400 text-sm">
                  ฿
                  {item.sku.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <div className="flex items-center justify-center border border-gray-600 rounded py-2">
                  <button
                    className="text-lg font-bold text-white px-3 cursor-pointer"
                    onClick={() =>
                      addToCart({
                        product: {
                          _id: item.productId,
                          name: item.productName,
                          image: item.productImage,
                          store: {
                            _id: String(item.store?.id),
                            slug: item?.store?.slug,
                            name: item?.store?.name || "",
                          },
                          skuCount: 1, // ไม่ได้ใช้ใน Cart แต่ต้องมี
                        },
                        sku: { _id: item.sku.skuId, ...item.sku },
                        quantity: -1,
                      })
                    }
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
                    onClick={() =>
                      addToCart({
                        product: {
                          _id: item.productId,
                          name: item.productName,
                          image: item.productImage,
                          store: {
                            _id: String(item.store?.id),
                            slug: item?.store?.slug,
                            name: item?.store?.name || "",
                          },
                          skuCount: 1, // ไม่ได้ใช้ใน Cart แต่ต้องมี
                        },
                        sku: { _id: item.sku.skuId, ...item.sku },
                        quantity: 1,
                      })
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <p className="text-green-400 text-sm">
                  ฿
                  {(item.quantity * item.sku.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <button
                  className="text-red-500 hover:text-red-700 border border-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    removeFromCart(item.productId, item.sku.skuId);
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
            <div className="flex justify-between mb-6">
              <p className="text-lg text-green-500 font-semibold">
                Total products
              </p>
              <p className="text-lg text-green-500 font-semibold">
                ฿
                {totalPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="flex justify-center text-center mr-4 ml-4">
              <Link
                href="checkout"
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
