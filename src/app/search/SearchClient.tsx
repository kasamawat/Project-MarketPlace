"use client";

import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import React from "react";
import { StorePubilc } from "@/types/store/stores.types";
import { ImageItemDto } from "@/types/product/products.types";

type Props = {
  initialTerm: string;
  initialProducts: {
    items: {
      name: string;
      price: number;
      productId: string;
      storeId: string;
      cover: ImageItemDto;
    }[];
    total: number;
  };
  initialStores: { items: StorePubilc[]; total: number };
};

export default function SearchClient({
  initialTerm,
  initialProducts,
  initialStores,
}: Props): React.ReactElement {
  if (!initialTerm) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-gray-400">
        พิมพ์คำค้นหาเพื่อเริ่มต้น
      </div>
    );
  }

  if (
    !initialProducts ||
    !initialStores ||
    (initialProducts.total === 0 && initialStores.total === 0)
  ) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-gray-400">
        ไม่พบผลลัพธ์สำหรับ “{initialTerm}”
      </div>
    );
  }

  const products = initialProducts.items;
  console.log(products, "products");

  const stores = initialStores.items;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Facets (ถ้ามี) – คุณจะ map facets ที่ initialData.products.facets มาด้านข้างได้ */}
      <div className="grid grid-cols-12 gap-6">
        <aside className="hidden lg:block col-span-3">
          {/* TODO: Facets UI */}
        </aside>

        <main className="col-span-12 lg:col-span-9 space-y-8">
          {stores.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold">
                ร้านค้าที่เกี่ยวข้องกับ “{initialTerm}”
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stores.map((s) => (
                  <li key={s._id}>
                    <Link
                      href={`/stores/${s._id}`}
                      className="block p-3 bg-gray-800 rounded-md hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={s.logoUrl ?? "/default-banner.png"}
                          alt={s.name}
                          width={72}
                          height={72}
                          className="object-cover rounded-full border border-gray-600"
                        />
                        <div>
                          <div className="font-medium">{s.name}</div>
                          {/* province/rating ฯลฯ */}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <div className="text-gray-400">
              ผลลัพธ์สำหรับ “{initialTerm}”
            </div>
            <h2 className="mb-3 font-semibold">สินค้า</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard
                    key={p.productId}
                    product={{
                      _id: p.productId,
                      name: p.name,
                      priceTo: p.price,
                      skuCount: p.skuCount,
                      cover: p.cover,
                      // thumbnail: p.thumbnail,
                      // rating: p.rating,
                      // ... map field ที่การ์ดใช้
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-400">ไม่มีสินค้า</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
