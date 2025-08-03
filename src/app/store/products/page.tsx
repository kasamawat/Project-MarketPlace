"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Modal from "@/components/Modal";
import ProductForm from "./productForm";
import {
  ProductBase,
  ProductVariant,
} from "@/types/product/base/product-base.types";
// import { ProductCategory } from "@/types/product/enums/product-category.enum";
// import { ProductType } from "@/types/product/enums/product-type.enum";
import React from "react";
import VariantForm from "./VariantForm";
import VariantTable from "./VariantTable";

type ModalProductState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; product: ProductBase };
type ModalVariantState =
  | { type: "none" }
  | { type: "set"; id: string | number; variant: ProductVariant };

export default function ProductList(): React.ReactElement {
  const [products, setProducts] = useState<ProductBase[]>([
    // {
    //   id: "P1",
    //   storeId: "store123",
    //   name: "Test Product",
    //   description: "A sample product for testing",
    //   image: "/no-image.png",
    //   price: 299,
    //   stock: 10,
    //   category: ProductCategory.Accessory,
    //   type: ProductType.Physical,
    //   store: {
    //     id: "store123",
    //     name: "My Store",
    //     slug: "my-store",
    //     description: "A great store",
    //     phone: "0123456789",
    //     productCategory: "Accessory",
    //     returnPolicy: "No return",
    //     bankName: "",
    //     bankAccountNumber: "",
    //     bankAccountName: "",
    //     status: "approved",
    //     ownerId: "1",
    //     createdAt: new Date(),
    //   },
    // },
    // {
    //   id: "P2",
    //   storeId: "store123",
    //   name: "กระเป๋าวิเศษ",
    //   description: "ของ โดราเอม่อน",
    //   category: ProductCategory.Accessory,
    //   type: ProductType.Physical,
    //   store: {
    //     id: "store123",
    //     name: "My Store",
    //     slug: "my-store",
    //     description: "A great store",
    //     phone: "0123456789",
    //     productCategory: "Accessory",
    //     returnPolicy: "No return",
    //     bankName: "",
    //     bankAccountNumber: "",
    //     bankAccountName: "",
    //     status: "approved",
    //     ownerId: "1",
    //     createdAt: new Date(),
    //   },
    //   variants: [
    //     {
    //       id: "V1",
    //       name: "Color", // ใส่ชื่อ group (เช่น "สี" หรือ "ขนาด")
    //       value: "Red",
    //       price: 0,
    //       stock: 0,
    //     },
    //   ],
    // },
  ]);
  const [modalProduct, setModalProduct] = useState<ModalProductState>({
    type: "none",
  });
  const [modalVariant, setModalVariant] = useState<ModalVariantState>({
    type: "none",
  });

  const [openVariantIds, setOpenVariantIds] = useState<(string | number)[]>([]);
  // const [openVariantId, setOpenVariantId] = useState<string | number | null>(
  //   null
  // );

  // สำหรับเปิดหลายตัวพร้อมกัน (multiple open)
  const toggleVariant = (id: string | number) => {
    setOpenVariantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  // ถ้าต้องการเปิดทีละตัว (single open)
  // const toggleVariantRowSingle = (id: string | number) => {
  //   setOpenVariantId((prev) => (prev === id ? null : id));
  // };

  // ========================== Product ==========================
  // เพิ่มสินค้าใหม่เข้า list
  const handleAddSuccess = (product: ProductBase) => {
    setProducts((prev) => [...prev, product]);
    setModalProduct({ type: "none" });
  };

  // อัปเดตสินค้าใน list หลัง edit สำเร็จ
  const handleEditSuccess = (updated: ProductBase) => {
    console.log(updated, "updated");

    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setModalProduct({ type: "none" });
  };
  // =============================================================

  function updateVariantTree(
    variants: ProductVariant[] = [],
    variantToUpdate: ProductVariant
  ): ProductVariant[] {
    return variants.map((v) => {
      if (v.id === variantToUpdate.id) {
        // เจอ variant ที่ id ตรงกัน → อัปเดต
        return { ...variantToUpdate };
      }
      // ถ้ามี subVariant ให้ไปวนซ้ำ
      if (v.variants && v.variants.length > 0) {
        return {
          ...v,
          variants: updateVariantTree(v.variants, variantToUpdate),
        };
      }
      return v;
    });
  }

  const handleSetSuccess = (id: string | number, variant: ProductVariant) => {
    // console.log(products,'products');
    console.log(variant, "variant");
    setProducts((prev) =>
      prev.map((p) => {
        console.log(id, "id");

        if (p.id !== id) return p;
        // ถ้ายังไม่มี variants ให้สร้างใหม่
        if (!p.variants) {
          return { ...p, variants: [variant] };
        }

        // ถ้ามีอยู่แล้ว → update แบบ recursive
        const found = findVariantInTree(p.variants, variant.id);
        console.log(found, "found");

        return {
          ...p,
          variants: found
            ? updateVariantTree(p.variants, variant)
            : [...p.variants, variant],
        };
      })
    );
    setModalVariant({ type: "none" });
  };

  // Helper หา variant ในต้นไม้
  function findVariantInTree(variants: ProductVariant[], id: string): boolean {
    for (const v of variants) {
      if (v.id === id) return true;
      if (v.variants && v.variants.length > 0) {
        if (findVariantInTree(v.variants, id)) return true;
      }
    }
    return false;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link
          href={`/store/dashboard`}
          className="text-sm text-indigo-500 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Product List</h1>
        <button
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
          onClick={() => setModalProduct({ type: "add" })}
        >
          +Add Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-left bg-gray-800 rounded-xl border border-gray-700">
          <thead className="bg-gray-600 text-white">
            <tr className="text-center">
              <th className="px-4 py-3 border border-gray-700 w-1/6">Name</th>
              <th className="px-4 py-3 border border-gray-700 w-1/6">
                Category
              </th>
              <th className="px-4 py-3 border border-gray-700 w-1/6">Type</th>
              <th className="px-4 py-3 border border-gray-700 w-1/6">Image</th>
              <th className="px-4 py-3 border border-gray-700 w-1/6">
                Price (THB)
              </th>
              <th className="px-4 py-3 border border-gray-700 w-1/6">Stock</th>
              <th className="px-4 py-3 border border-gray-700 w-1/6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <React.Fragment key={p.id}>
                <tr
                  className={`border-gray-700 hover:bg-gray-900 ${
                    Array.isArray(p.variants) && p.variants.length > 0
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={() => {
                    console.log(p, "product");
                    if (Array.isArray(p.variants) && p.variants.length > 0) {
                      toggleVariant(p.id);
                    }
                  }}
                >
                  <td className="px-4 py-3 border border-gray-700 text-left">
                    {p.name}
                    {p.variants && p.variants.length > 0 && (
                      <span className="ml-2 text-xs">
                        {openVariantIds.includes(p.id) ? "▲" : "▼"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-left">
                    {p.category}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-left">
                    {p.type}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-center">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={80}
                        height={80}
                        className="h-25 w-25 mx-auto rounded border-1 border-red-700"
                      />
                    ) : null}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-right">
                    {p.price?.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-right">
                    {p.stock || ""}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-center space-y-1">
                    <button
                      onClick={() =>
                        setModalProduct({ type: "edit", product: p })
                      }
                      className="px-2 py-1 text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button className="px-2 py-1 text-red-600 hover:text-red-700 hover:underline cursor-pointer">
                      Delete
                    </button>
                  </td>
                </tr>
                {/* --- แถวแสดง variants ถ้ามี --- */}
                {Array.isArray(p.variants) &&
                  p.variants.length > 0 &&
                  openVariantIds.includes(p.id) && (
                    <tr className="bg-gray-900/70">
                      <td colSpan={7} className="border-gray-800">
                        <div className="ml-4 mb-4">
                          {/* <div className="font-bold mb-1 text-gray-300">
                            Variants:
                          </div> */}
                          <VariantTable
                            variants={p.variants}
                            productId={p.id}
                            onSet={(productId, variant) =>
                              setModalVariant({
                                type: "set",
                                id: productId,
                                variant: variant,
                              })
                            }
                            openVariantIds={openVariantIds}
                            onToggle={toggleVariant}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
              </React.Fragment>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      {modalProduct.type !== "none" && (
        <Modal onClose={() => setModalProduct({ type: "none" })}>
          {modalProduct.type === "add" && (
            <>
              <div className="mb-5 text-2xl font-bold">Add Product</div>
              <ProductForm
                mode="add"
                onSuccess={handleAddSuccess}
                onCancel={() => setModalProduct({ type: "none" })}
              />
            </>
          )}
          {modalProduct.type === "edit" && (
            <>
              <div className="mb-5 text-2xl font-bold">Edit Product</div>
              <ProductForm
                mode="edit"
                product={modalProduct.product}
                onSuccess={handleEditSuccess}
                onCancel={() => setModalProduct({ type: "none" })}
              />
            </>
          )}
        </Modal>
      )}

      {/* Modal Set Variant */}
      {modalVariant.type !== "none" && (
        <Modal onClose={() => setModalVariant({ type: "none" })}>
          {modalVariant.type === "set" && (
            <>
              <div className="mb-5 text-2xl font-bold">
                Setting Variant : {modalVariant.id?.toString()}
              </div>
              <VariantForm
                variant={modalVariant.variant}
                productId={modalVariant.id?.toString()}
                onSuccess={handleSetSuccess}
                onCancel={() => setModalVariant({ type: "none" })}
              />
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
