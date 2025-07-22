"use client";
import React, { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types/product.types";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"; // ใส่ไว้ด้านบนของไฟล์
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";

const mockStart = 4.5; // ตัวอย่างค่า rating ที่ใช้แสดงดาว
const opacitys = ["128GB", "256GB", "512GB"];
const colors = ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"];

export default function ClientProductDetail({ product }: { product: Product }) {
  //   const product = await getProduct(type_, id);
  const [selected, setSelected] = useState<string | null>(opacitys[0]);
  const [colorSelected, setColorSelected] = useState<string | null>(colors[0]);
  const [count, setCount] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  if (!product) {
    notFound();
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs
          paths={[
            { name: "Home", href: "/", status: "link" },
            { name: "Products", href: "/products", status: "link" },
            {
              name: product.name,
              href: "",
              status: "disabled",
            },
          ]}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="w-full pl-6 pr-6">
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={600}
            className="w-full h-auto object-cover rounded-md shadow rounded border-1 border-solid border-gray-600"
          />
        </div>
        <div className="w-full pl-6 pr-6">
          <h1 className="text-3xl font-bold mb-2 text-white">{product.name}</h1>
          <div className="mb-2">
            <p className="text-green-400 text-xl font-semibold mt-2">
              ฿
              {product.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="mb-2">
            <h3 className="text-md font-bold text-sm">
              Sold By:{" "}
              <Link
                href={`/stores/${product.store.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                {product.store.name}
              </Link>
            </h3>
          </div>
          <div className="flex items-center text-yellow-400 text-lg mt-4">
            {[1, 2, 3, 4, 5].map((i) =>
              i <= Math.floor(mockStart) ? (
                <FaStar key={i} />
              ) : i - 0.5 === mockStart ? (
                <FaStarHalfAlt key={i} />
              ) : (
                <FaRegStar key={i} />
              )
            )}
            <span className="ml-2 text-lg text-gray-400">
              ({mockStart} / 5)
            </span>
          </div>
          <div className="pb-8 mt-4 mb-4 border-b-1 border-solid border-gray-600">
            <span className="text-white text-ld">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime
              pariatur quod at nobis officia corporis consequatur ducimus ipsa,
              odio iusto necessitatibus obcaecati neque saepe nam numquam totam,
              dicta accusamus laborum!
            </span>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2">
              <div className="flex flex-col mb-2">
                <span className="text-md text-white pb-2">Capacity</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {opacitys.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelected(option);
                      console.log(`Selected option: ${option}`);
                    }}
                    className={`text-sm p-1 border-1 border-solid border-gray-600 cursor-pointer ${
                      selected === option
                        ? "bg-gray-500 text-white border-gray-600"
                        : "border-gray-600 text-white hover:bg-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-3">
              <div className="flex flex-col mb-2">
                <span className="text-md text-white pb-2">Color</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setColorSelected(color);
                      console.log(`Selected option: ${color}`);
                    }}
                    title={color}
                    className={`w-9 h-9 rounded-full cursor-pointer flex items-center justify-center ${
                      colorSelected === color
                        ? "border-1 border-solid border-gray-600"
                        : "border-gray-600 text-white"
                    }`}
                  >
                    <div
                      className="text-sm w-6 h-6 p-1 rounded-full border-1 border-solid border-gray-600"
                      style={{ backgroundColor: color }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6 items-center">
            {/* กล่องจำนวน */}
            <div className="col-span-1">
              <div className="flex items-center justify-center w-full border border-gray-600 rounded px-4 py-2">
                <button
                  className="text-lg font-bold text-white px-3 cursor-pointer"
                  onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="text"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-10 text-center bg-transparent text-white outline-none mx-2"
                  disabled
                />
                <button
                  className="text-lg font-bold text-white px-3 cursor-pointer"
                  onClick={() => setCount((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* ปุ่ม Add to Cart */}
            <div className="col-span-2">
              <button
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded transition-colors duration-300 cursor-pointer"
                onClick={() => addToCart(product, count)}
              >
                Add to Cart
              </button>
            </div>

            {/* ปุ่ม Buy Now */}
            <div className="col-span-1">
              <button
                className={`w-full font-semibold py-3 px-4 rounded transition-colors duration-300 ${
                  isWishlisted
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
                onClick={() => {
                  setIsWishlisted((prev) => !prev);
                  console.log(count);
                }}
              >
                {isWishlisted ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
          <div className="mt-6">
            <span className="text-gray-500 text-md font-semibold">
              Categories : fashion
            </span>
          </div>
          <div className="mt-2">
            <span className="text-gray-500 text-md font-semibold">
              Tags : fashion
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
