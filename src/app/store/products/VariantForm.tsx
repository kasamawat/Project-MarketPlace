// VariantModal.tsx
"use client";
import { useEffect, useState } from "react";
import { ProductVariantBase } from "@/types/product/base/product-base.types";
import toast from "react-hot-toast";

interface Props {
  variant: ProductVariantBase;
  onSuccess?: (id: string, variant: ProductVariantBase) => void;
  onCancel?: () => void;
  productId?: string;
}

const initialForm: ProductVariantBase = {
  _id: "", // ถ้าสร้างใหม่ _id เป็น "" หรือ undefined
  name: "",
  image: "",
  price: 0,
  stock: 0,
  variants: [],
};

export default function VariantModal({
  variant,
  onSuccess,
  onCancel,
  productId,
}: Props) {
  console.log(variant, "variant");

  const [form, setForm] = useState<ProductVariantBase>(variant || initialForm);
  const [subVariantGroup, setSubVariantGroup] = useState(
    variant?.variants?.[0]?.name || ""
  ); // เช่น สี, ขนาด ฯลฯ

  const [subVariantValues, setSubVariantValues] = useState<string[]>([]);
  const [subVariantInput, setSubVariantInput] = useState("");

  const [hasVariant, setHasVariant] = useState(false);

  // sync เมื่อ prop product มาใหม่ (edit)
  useEffect(() => {
    if (variant) {
      setForm(variant);
      setHasVariant(
        Array.isArray(variant.variants) && variant.variants.length > 0
      );
      setSubVariantValues(
        Array.isArray(variant?.variants)
          ? variant.variants
              .map((sv) => sv.value)
              .filter((v): v is string => typeof v === "string")
          : []
      );
    }
  }, [variant]);

  const addVariantValue = () => {
    const val = subVariantInput.trim();
    if (val && !subVariantValues.includes(val)) {
      setSubVariantValues((prev) => [...prev, val]);
      setSubVariantInput("");
    } else {
      toast.error(`มี ${val} แล้ว`);
    }
  };
  const handleVariantInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addVariantValue();
    }
  };
  const removeVariantValue = (idx: number) => {
    setSubVariantValues((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasVariant && subVariantValues.length === 0) {
      toast.error("กรุณาเพิ่มอย่างน้อย 1 ตัวเลือก Sub Variant");
      return;
    }

    const variantData = { ...form };

    if (hasVariant) {
      if (subVariantValues.length === 0) return;
      variantData.variants = subVariantValues
        .filter((v) => v.trim() !== "")
        .map((v) => ({
          // _id: "",
          name: subVariantGroup, // group เดียวกัน เช่น "สี" หรือ "ขนาด"
          value: v, // value จาก input
          image: "",
          price: 0,
          stock: 0,
          variants: [],
        }));

      delete variantData.image;
      delete variantData.price;
      delete variantData.stock;
    } else {
      // ถ้าไม่มี variant, ลบ variants ออก
      delete variantData.variants;
    }

    let responseProductVariant: ProductVariantBase | null = null;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/variant`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant: variantData }),
        credentials: "include",
      }
    );

    if (!res.ok) {
      // handle error
      toast.error("Add failed");
      return;
    }

    responseProductVariant = await res.json();

    if (!productId) return;
    onSuccess?.(productId, responseProductVariant!);
  };

  // Modal เปิดปิดคุมจาก parent
  if (!open) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-1">Variant Group</label>
        <input
          name="name"
          type="text"
          className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900 opacity-60"
          value={form.name}
          required
          disabled
        />
      </div>

      <div>
        <label className="block mb-1">Variant Value</label>
        <input
          name="name"
          type="text"
          className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900 opacity-60"
          value={form.value}
          required
          disabled
        />
      </div>

      <div className="mb-4 flex items-center">
        <input
          name="variant"
          id="hasVariant"
          type="checkbox"
          checked={hasVariant}
          onChange={(e) => {
            setHasVariant(e.target.checked);
            if (e.target.checked) {
              setForm((prev) => {
                const { image, price, stock, ...rest } = prev;
                return rest;
              });
            } else {
              setForm((prev) => {
                const { variants, ...rest } = prev;
                return rest;
              });
            }
          }}
          className="mr-2"
        />
        <label htmlFor="hasVariant" className="text-sm select-none text-white">
          คุณต้องการเพิ่มตัวเลือกย่อย (Sub Variant) สำหรับสินค้าในกลุ่ม “Color”
          (เช่น Red) เช่น “Size” (L, M, S ฯลฯ)
        </label>
      </div>

      {!hasVariant && (
        <>
          <div>
            <label className="block mb-1">Image URL</label>
            <input
              name="image"
              type="text"
              className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
              value={form.image ?? ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1">Price (THB)</label>
            <input
              name="price"
              type="number"
              className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
              value={form.price ?? ""}
              onChange={handleChange}
              min={0}
              step={0.01}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Stock</label>
            <input
              name="stock"
              type="number"
              className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
              value={form.stock ?? ""}
              onChange={handleChange}
              min={0}
              step={1}
              required
            />
          </div>
        </>
      )}
      {hasVariant && (
        <div>
          <label className="block mb-1">Sub Variant Group</label>
          <input
            name="variantGroup"
            type="text"
            className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
            value={subVariantGroup}
            onChange={(e) => setSubVariantGroup(e.target.value)}
            required
          />
          <label className="block mb-1 mt-3">Sub Variant Value</label>
          {/* tags list */}
          <div className="flex flex-wrap gap-2 mb-2">
            {subVariantValues.map((val, idx) => (
              <span
                key={idx}
                className="flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm"
              >
                {val}
                <button
                  type="button"
                  className="ml-2 text-red-600 hover:text-red-800 cursor-pointer"
                  onClick={() => removeVariantValue(idx)}
                  title="ลบ"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {/* input for new tag */}
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 rounded text-white border border-gray-600 bg-gray-900"
              value={subVariantInput}
              onChange={(e) => setSubVariantInput(e.target.value)}
              onKeyDown={handleVariantInputKeyDown}
              placeholder="พิมพ์แล้วกด Enter หรือ +"
            />
            <button
              type="button"
              className="px-3 rounded text-indigo-600 border border-gray-600 bg-gray-900 cursor-pointer"
              onClick={addVariantValue}
              disabled={!subVariantInput.trim()}
              title="เพิ่ม"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white cursor-pointer"
        >
          Save Variant
        </button>
        <button
          type="button"
          onClick={() => {
            setForm(variant ?? initialForm);
            setHasVariant(
              Array.isArray(variant?.variants) && variant.variants.length > 0
            );
            onCancel?.();
          }}
          className="text-red-600 hover:text-red-700 hover:underline cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
