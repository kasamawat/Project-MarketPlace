"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import ProductDetailTab from "@/components/store/product-create/ProductDetailTab";
import ManageProductTab from "@/components/store/product-create/ManageProductTab";

import {
  ProductBase,
  ProductDetailFormInput,
  ManageProductFormInput,
} from "@/types/product/base/product-base.types";
import { ProductCategory } from "@/types/product/enums/product-category.enum";
import { ProductType } from "@/types/product/enums/product-type.enum";

type Props = {
  mode: "add" | "edit";
  initialProduct?: ProductBase;
};

const makeInitial = (p?: ProductBase): ProductBase => ({
  _id: p?._id ?? "",
  name: p?.name ?? "",
  description: p?.description ?? "",
  image: p?.image ?? "",
  category: p?.category ?? ProductCategory.allCategory,
  type: p?.type ?? ProductType.allType,
  store: p?.store ?? {
    _id: "",
    name: "",
    logoUrl: "",
    coverUrl: "",
    slug: "",
    description: "",
    phone: "",
    productCategory: "",
  },
  price: p?.price, // undefined เมื่อมี variants
  stock: p?.stock, // undefined เมื่อมี variants
  variants: p?.variants ?? [],
  status: p?.status ?? "draft",
});

export default function ProductEditor({ mode, initialProduct }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"detail" | "manage">("detail");
  const [product, setProduct] = useState<ProductBase>(() =>
    makeInitial(initialProduct)
  );
  const [loading, setLoading] = useState(false);

  const canGoManage = !!product.name && !!product.category && !!product.type;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!product.name || !product.category || !product.type) {
      toast.error("กรอกข้อมูลให้ครบถ้วน");
      setTab("detail");
      return;
    }

    const hasVariants =
      Array.isArray(product.variants) && product.variants.length > 0;

    if (!hasVariants) {
      if (product.price == null || product.stock == null) {
        toast.error("กรอกราคาและสต็อก");
        setTab("manage");
        return;
      }
    }

    // เตรียม payload ให้สะอาด (ลบ price/stock ถ้ามี variants)
    let productToSave: ProductBase = product;
    if (hasVariants) {
      const { price, stock, ...rest } = productToSave as ProductBase;
      productToSave = rest as ProductBase;
    }

    try {
      setLoading(true);

      const url =
        mode === "edit"
          ? `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/products`;

      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSave),
      });

      if (!res.ok) {
        let msg = "บันทึกไม่สำเร็จ";
        try {
          const err = await res.json();
          msg = err?.message ?? msg;
        } catch {}
        throw new Error(msg);
      }

      toast.success(mode === "edit" ? "อัปเดตสำเร็จ!" : "สร้างรายการสำเร็จ!");
      router.push("/store/products");
      router.refresh();
    } catch (err: unknown) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Tabs */}
      <div className="flex border-b mb-8">
        <button
          type="button"
          className={`px-4 py-2 ${
            tab === "detail"
              ? "border-b-2 border-indigo-500 text-indigo-600 font-bold"
              : "text-gray-500"
          }`}
          onClick={() => setTab("detail")}
        >
          Product Detail
        </button>
        <button
          type="button"
          className={`px-4 py-2 ml-4 ${
            tab === "manage"
              ? "border-b-2 border-indigo-500 text-indigo-600 font-bold"
              : "text-gray-500"
          }`}
          disabled={!canGoManage}
          onClick={() => {
            if (!canGoManage) {
              toast.error("กรอกข้อมูลให้ครบถ้วน");
              return;
            }
            setTab("manage");
          }}
        >
          Manage / Options
        </button>
      </div>

      {/* Tab Content */}
      {tab === "detail" && (
        <ProductDetailTab
          value={{
            name: product.name,
            description: product.description,
            image: product.image,
            category: product.category,
            type: product.type,
          }}
          onChange={(detail: ProductDetailFormInput) =>
            setProduct((prev) => ({ ...prev, ...detail }))
          }
          onNext={() => {
            if (!canGoManage) {
              toast.error("กรอกข้อมูลให้ครบถ้วน");
              return;
            }
            setTab("manage");
          }}
        />
      )}

      {tab === "manage" && (
        <ManageProductTab
          value={{
            _id: product._id,
            price: product.price,
            stock: product.stock,
            variants: product.variants,
            category: product.category, // ถ้าจำเป็นใน tab นี้
          }}
          onChange={(manage: ManageProductFormInput) => {
            // merge + ลบ key ที่เป็น undefined ออก
            let merged: ProductBase = { ...product, ...manage };
            if (manage.price === undefined) {
              const { price, ...rest } = merged;
              merged = rest;
            }
            if (manage.stock === undefined) {
              const { stock, ...rest } = merged;
              merged = rest;
            }
            setProduct(merged);
          }}
          loading={loading}
          onBack={() => setTab("detail")}
        />
      )}

      {/* Footer buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-800"
          onClick={() => history.back()}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
