"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Modal from "@/components/Modal";
import {
  ProductBase,
  ProductVariantBase,
} from "@/types/product/base/product-base.types";
// import { ProductCategory } from "@/types/product/enums/product-category.enum";
// import { ProductType } from "@/types/product/enums/product-type.enum";
import React from "react";
import VariantTable from "./VariantTable";
import ConfirmModal from "@/components/ConfirmModal";
import toast from "react-hot-toast";
import { removeVariantInTree } from "@/lib/functionTools";

type ModalProductState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; product: ProductBase };
type ModalVariantState =
  | { type: "none" }
  | { type: "set"; id: string | number; variant: ProductVariantBase };

type DeleteTarget =
  | { type: "product"; productId: string | number }
  | { type: "variant"; productId: string | number; variantId: string | number };

export default function ProductList(): React.ReactElement {
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "GET",
        cache: "no-store",
        credentials: "include", // <<--- ส่ง cookie token ด้วย
      });
      if (res.ok) {
        const data: ProductBase[] = await res.json();
        setProducts(data); // <<--- เซ็ตข้อมูลที่ได้
      } else {
        // handle error ตามต้องการ
        setProducts([]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

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

    setProducts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
    setModalProduct({ type: "none" });
  };
  // =============================================================

  const updateVariantTree = (
    variants: ProductVariantBase[] = [],
    variantToUpdate: ProductVariantBase
  ): ProductVariantBase[] => {
    return variants.map((v) => {
      if (v._id === variantToUpdate._id) {
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
  };

  // Helper หา variant ในต้นไม้
  const findVariantInTree = (
    variants: ProductVariantBase[],
    id: string
  ): boolean => {
    for (const v of variants) {
      if (v._id === id) return true;
      if (v.variants && v.variants.length > 0) {
        if (findVariantInTree(v.variants, id)) return true;
      }
    }
    return false;
  };

  const handleSetSuccess = (
    id: string | number,
    variant: ProductVariantBase
  ) => {
    console.log(variant, "variant");
    setProducts((prev) =>
      prev.map((p) => {
        console.log(id, "id");

        if (p._id !== id) return p;
        // ถ้ายังไม่มี variants ให้สร้างใหม่
        if (!p.variants) {
          return { ...p, variants: [variant] };
        }

        // ถ้ามีอยู่แล้ว → update แบบ recursive
        const found = findVariantInTree(p.variants, variant._id as string);
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

  const handleDelete = async (target: DeleteTarget) => {
    try {
      if (target.type === "product") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${target.productId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (res.ok) {
          toast.success("Product deleted successfully");
          setProducts((prev) => prev.filter((p) => p._id !== target.productId));
        } else {
          const data = await res.json();
          toast.error(data.message || "Failed to delete product");
        }
      } else if (target.type === "variant") {
        // DELETE variant ด้วย productId, variantId (แนะนำสร้าง endpoint DELETE /products/:productId/variant/:variantId)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${target.productId}/variant/${target.variantId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (res.ok) {
          toast.success("Variant deleted successfully");
          // ลบออกจาก state ใน frontend
          setProducts((prev) =>
            prev.map((p) =>
              p._id === target.productId
                ? {
                    ...p,
                    variants: Array.isArray(p.variants)
                      ? removeVariantInTree(p.variants, target.variantId)
                      : [],
                  }
                : p
            )
          );
        } else {
          const data = await res.json();
          toast.error(data.message || "Failed to delete variant");
        }
      }
    } catch (err) {
      toast.error("An error occurred while deleting");
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
        <Link
          href={"/store/products/create"}
          className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
        >
          +Add Product
        </Link>
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
              <th className="px-4 py-3 border border-gray-700 w-1/6">Status</th>
              <th className="px-4 py-3 border border-gray-700 w-1/6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <React.Fragment key={p._id}>
                <tr
                  className={`border-gray-700 hover:bg-gray-950 ${
                    Array.isArray(p.variants) && p.variants.length > 0
                      ? "cursor-pointer"
                      : ""
                  } ${openVariantIds.includes(p._id) ? "bg-gray-900" : ""}`}
                  onClick={() => {
                    console.log(p, "product");
                    if (Array.isArray(p.variants) && p.variants.length > 0) {
                      toggleVariant(p._id);
                    }
                  }}
                >
                  <td className="px-4 py-3 border border-gray-700 text-left">
                    <div className="flex items-center">
                      {/* Col 1: caret icon (20% width) */}
                      <div className="w-1/5 flex justify-center items-center">
                        {p.variants && p.variants.length > 0 && (
                          <span className="text-xs">
                            {openVariantIds.includes(p._id) ? (
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
                                className="icon icon-tabler icons-tabler-outline icon-tabler-caret-down"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M6 10l6 6l6 -6h-12" />
                              </svg>
                            ) : (
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
                                className="icon icon-tabler icons-tabler-outline icon-tabler-caret-right"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M10 18l6 -6l-6 -6v12" />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                      {/* Col 2: value (80%) */}
                      <div className="w-4/5 pl-2 truncate">{p.name}</div>
                    </div>
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
                    {typeof p.price === "number"
                      ? p.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })
                      : ""}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-right">
                    {typeof p.stock === "number"
                      ? p.stock.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                        })
                      : ""}
                  </td>
                  <td className="px-4 py-3 border border-gray-700 text-center">
                    {p.status}
                  </td>
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-3 border border-gray-700 text-center space-y-1"
                  >
                    <Link
                      href={`/store/products/${p._id}/edit`}
                      className="px-2 py-1 text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        setDeleteTarget({ type: "product", productId: p._id })
                      }
                      className="px-2 py-1 text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {/* --- แถวแสดง variants ถ้ามี --- */}
                {Array.isArray(p.variants) &&
                  p.variants.length > 0 &&
                  openVariantIds.includes(p._id) && (
                    <tr className="bg-gray-900/70">
                      <td colSpan={8} className="border-gray-800">
                        <div className="ml-8 mb-4">
                          {/* <div className="font-bold mb-1 text-gray-300">
                            Variants:
                          </div> */}
                          <VariantTable
                            variants={p.variants}
                            productId={p._id}
                            onSet={(productId, variant) =>
                              setModalVariant({
                                type: "set",
                                id: productId,
                                variant: variant,
                              })
                            }
                            openVariantIds={openVariantIds}
                            onToggle={toggleVariant}
                            onDelete={(productId, variantId) => {
                              setDeleteTarget({
                                type: "variant",
                                productId: productId,
                                variantId: variantId,
                              });
                            }}
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

      {/* Modal แยก */}
      <ConfirmModal
        open={!!deleteTarget}
        title="ยืนยันการลบ"
        message="คุณต้องการลบรายการนี้ใช่หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={() => {
          if (!deleteTarget) return;
          handleDelete(deleteTarget); // ส่ง object ที่ type ชัดเจน
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
