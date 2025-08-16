"use client";

import { ProductCategory } from "@/types/product/enums/product-category.enum";
import { ProductType } from "@/types/product/enums/product-type.enum";
import {
  ProductDetailFormInput,
  ProductEditorState,
  SkuRow,
} from "@/types/product/products.types";
// import { ProductStatus, SkuInput } from "@/types/product/products.types";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import ManageProductTab from "../product-create/ManageProductTab";
import ProductDetailTab from "../product-create/ProductDetailTab";
import { toUpdatePayload, toCreatePayload } from "@/lib/helpers/state-payload";
import { diffSkus } from "@/lib/helpers/productEdit";

type Props = {
  mode: "add" | "edit";
  initialProduct?: ProductEditorState;
};

const makeInitial = (p?: Partial<ProductEditorState>): ProductEditorState => ({
  _id: p?._id ?? "",
  name: p?.name ?? "",
  description: p?.description ?? "",
  image: p?.image ?? "",
  category: p?.category ?? ProductCategory.allCategory,
  type: p?.type ?? ProductType.allType,
  defaultPrice: p?.defaultPrice, // ใช้แทน product.price เดิม
  status: p?.status ?? "draft",
  skus: p?.skus ?? [
    // ค่าเริ่มต้น: base SKU 1 ตัว (สำหรับสินค้าธรรมดา)
    { attributes: {}, price: p?.defaultPrice },
  ],
});

export default function ProductEditor({ mode, initialProduct }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"detail" | "manage">("detail");
  const [product, setProduct] = useState<ProductEditorState>(() =>
    makeInitial(initialProduct)
  );
  const [loading, setLoading] = useState(false);

  const canGoManage = !!product.name && !!product.category && !!product.type;

  const originalSkusRef = useRef<SkuRow[]>(initialProduct?.skus ?? []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!product.name || !product.category || !product.type) {
      toast.error("กรอกข้อมูลให้ครบถ้วน");
      setTab("detail");
      return;
    }

    try {
      setLoading(true);

      if (mode === "add") {
        // สร้าง: ยิงครั้งเดียว รวม SKUs ไปด้วย
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toCreatePayload(product)),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("สร้างรายการสำเร็จ!");
        router.push("/store/products");
        router.refresh();
        return;
      }

      // === EDIT ===
      // 1) อัปเดตเฉพาะข้อมูลสินค้า
      const res1 = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toUpdatePayload(product)), // ไม่รวม skus
        }
      );
      if (!res1.ok) throw new Error(await res1.text());

      // 2) เช็คว่า SKUs มีการเปลี่ยนแปลงไหม
      const {
        create,
        update,
        delete: del,
      } = diffSkus(originalSkusRef.current, product.skus ?? []);

      if (create.length || update.length || del.length) {
        const res2 = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/skus/batch`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ create, update, delete: del }),
          }
        );
        if (!res2.ok) throw new Error(await res2.text());

        // ถ้า BE คืนรายการ SKUs ปัจจุบันทั้งหมดกลับมา อัปเดต original เพื่อให้ diff ครั้งถัดไปถูกต้อง
        // const newSkus: SkuRow[] = await res2.json();
        // originalSkusRef.current = newSkus.map(s => ({
        //   _id: s._id, skuCode: s.skuCode, attributes: s.attributes, price: s.price,
        //   image: s.image, purchasable: s.purchasable
        // }));
      }

      toast.success("อัปเดตสำเร็จ!");
      router.push("/store/products");
      router.refresh();
    } catch (err) {
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
            defaultPrice: product.defaultPrice, // ← เพิ่ม
            status: product.status, // ถ้ามี field นี้ในฟอร์ม
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
            skus: product.skus,
            defaultPrice: product.defaultPrice,
            productName: product.name, // ช่วย autogen code (optional)
          }}
          onChange={(manage) => {
            setProduct((prev) => ({ ...prev, ...manage }));
          }}
          loading={loading}
          onBack={() => setTab("detail")}
        />
      )}

      {/* Footer buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-800 cursor-pointer"
          onClick={() => history.back()}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
