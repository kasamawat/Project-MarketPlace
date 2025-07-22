// components/ProductPreviewModal.tsx
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/types/product.types";
import Link from "next/link";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

type Props = {
  product: Product;
  onClose: () => void;
};

const mockStart = 4.5;

const ProductPreviewModal = ({
  product,
  onClose,
}: Props): React.ReactElement => {
  const { addToCart } = useCart();

  const opacitys = ["128GB", "256GB", "512GB"];
  const colors = ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"];

  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(opacitys[0]);
  const [colorSelected, setColorSelected] = useState<string | null>(colors[0]);
  const [count, setCount] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gray-900 rounded-lg max-w-4xl w-full h-auto relative transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 flex justify-end border-b-1 border-solid border-gray-600">
          <button
            className={`text-gray-500 hover:text-gray-700 text-2xl cursor-pointer`}
            onClick={handleClose}
          >
            &times;
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-4">
          <div className="col-span-1 sm:col-span-1 pl-2 pr-2">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-96 object-cover rounded border-1 border-solid border-gray-600"
            />
          </div>
          <div className="col-span-2 sm:col-span-2 pl-2 pr-2">
            <h2 className="text-xl font-bold mb-2 text-white">
              {product.name}
            </h2>
            <div className="mb-2">
              <span className="text-green-600 font-semibold text-lg mt-4">
                ฿
                {product.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
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
              <span className="text-white text-sm">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
                ut asperiores rem consectetur quae suscipit sint dicta excepturi
                totam ipsum, voluptate rerum cumque iure veritatis illum sequi
                commodi ullam enim.
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal;
