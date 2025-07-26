"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product/product.types";
import { getAllProducts } from "@/lib/products";
import { getAllStores } from "@/lib/stores";
import { Store } from "@/types/store.types";
import Image from "next/image";

type SearchResult = {
  id: string;
  name: string;
  type: "product" | "store";
};

type Props = {
  initialTerm: string;
  initialResults: SearchResult[];
};

export default function SearchClient({ initialTerm, initialResults }: Props) {
  const [results, setResults] = useState(initialResults);
  console.log(results, "results");
  // const products: Product[] = [];
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const allProducts = await getAllProducts();
      const matched = results
        .filter((x) => x.type === "product")
        .map((x) => allProducts.find((p) => p.id === x.id))
        .filter((p): p is Product => !!p); // filter out undefined
      setProducts(matched);
    }

    async function fetchStores() {
      const allStores = await getAllStores();
      const matched = results
        .filter((x) => x.type === "store")
        .map((x) => allStores.find((p) => p.id === x.id))
        .filter((p): p is Store => !!p);
      setStores(matched);
    }

    fetchProducts();
    fetchStores();
  }, [results]);

  useEffect(() => {
    // Optional: refetch if term changes (เช่นเรียก API ใหม่)
    setResults(initialResults);
  }, [initialTerm]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div>
        {/* <h2 className="text-lg font-semibold mb-2">
          Results for: <span className="text-blue-500">{initialTerm}</span>
        </h2> */}

        {results.length === 0 ? (
          <p className="text-gray-400">No results found.</p>
        ) : (
          <div>
            {stores.length > 0 ? (
              <div className="mb-4">
                <p className="mb-4">
                  ร้านค้าที่เกี่ยวข้องกับ {'"' + initialTerm + '"'}
                </p>
                <ul className="space-y-2">
                  {stores.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/stores/${item.id}`}
                        className="block p-3 bg-gray-800 rounded-md hover:bg-gray-700"
                      >
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-1 flex flex-col items-center text-md font-medium">
                            <Image
                              src={item.bannerUrl ?? "/default-banner.png"}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="object-cover rounded mr-4 ml-4 mt-2 mb-2 border border-solid border-gray-600 rounded-full"
                            />
                            <div className="mt-2 text-center">{item.name}</div>
                          </div>
                          <div className="col-span-3 font-medium">|TEST|</div>
                        </div>

                        {/* <div className="text-sm text-gray-400">{item.type}</div> */}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <></>
            )}

            {products.length > 0 ? (
              <div>
                <p className="mb-4">ค้นหา {'"' + initialTerm + '"'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
