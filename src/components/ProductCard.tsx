import Image from "next/image";
import { useState } from "react";
import ProductPreviewModal from "@/components/modals/ProductPreviewModal";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

const styles = {
  actionHidden: "opacity-0 transition-opacity duration-500",
  actionVisible: "opacity-100 transition-opacity duration-500",
  actionButton:
    "h-10 flex justify-center items-center text-sm bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-300",
};

export default function ProductCard({ product }: { product: Product }) {
  const [onHover, setOnHover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="flex flex-col">
        <div
          className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900 hover:shadow-lg transition cursor-pointer"
          onMouseOver={() => setOnHover(true)}
          onMouseOut={() => setOnHover(false)}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
          />

          <div
            className={`product-action flex justify-between ${
              onHover ? styles.actionVisible : styles.actionHidden
            }`}
          >
            <div
              className={`w-1/6 ${styles.actionButton} border-r border-gray-900`}
              onClick={() =>
                console.log(`Link ${product.id} : ${product.name}`)
              }
            >
              ❤️
            </div>
            <div
              className={`w-4/6 ${styles.actionButton}`}
              onClick={() =>
                console.log(`Add to cart ${product.id} : ${product.name}`)
              }
            >
              เพิ่มในรถเข็น
            </div>
            <div
              className={`w-1/6 ${styles.actionButton} border-l border-gray-900`}
              onClick={() => {
                console.log(`PreView ${product.id} : ${product.name}`);
                setShowPreview(true);
              }}
            >
              🔍
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-white font-semibold text-lg">{product.name}</h2>
          <p className="text-green-400 mt-1 font-bold">
            ฿{product.price.toLocaleString()}
          </p>
        </div>
      </div>
      {showPreview && (
        <ProductPreviewModal
          product={product}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
