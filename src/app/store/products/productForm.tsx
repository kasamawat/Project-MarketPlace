"use client";
import { useState, useEffect } from "react";
import { ProductBase } from "@/types/product/base/product-base.types";
import { ProductCategory } from "@/types/product/enums/product-category.enum";
import { ProductType } from "@/types/product/enums/product-type.enum";
import toast from "react-hot-toast";

type ProductFormProps = {
  product?: ProductBase;
  mode?: "add" | "edit";
  onSuccess?: (product: ProductBase) => void;
  onCancel?: () => void;
};

const initialForm: ProductBase = {
  _id: "", // ถ้าสร้างใหม่ _id เป็น "" หรือ undefined
  name: "",
  description: "",
  category: ProductCategory.allCategory,
  type: ProductType.allType,
  image: "",
  price: 0,
  stock: 0,
  variants: [],
};

export default function ProductForm({
  product,
  mode = "add",
  onSuccess,
  onCancel,
}: ProductFormProps) {
  console.log(product, "product");

  const [form, setForm] = useState<ProductBase>(product || initialForm);
  const [variantGroup, setVariantGroup] = useState(
    product?.variants?.[0]?.name || ""
  ); // เช่น สี, ขนาด ฯลฯ

  const [variantValues, setVariantValues] = useState<string[]>([]);
  const [variantInput, setVariantInput] = useState("");

  const [hasVariant, setHasVariant] = useState(false);

  // sync เมื่อ prop product มาใหม่ (edit)
  useEffect(() => {
    if (product) {
      setForm(product ?? initialForm);
      setHasVariant(
        Array.isArray(product.variants) && product.variants.length > 0
      );
      setVariantValues(
        Array.isArray(product?.variants)
          ? product.variants
              .map((sv) => sv.value)
              .filter((v): v is string => typeof v === "string")
          : []
      );
    }
  }, [product]);

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

  // const handleVariantValueChange = (idx: number, value: string) => {
  //   setVariantValues((prev) => prev.map((v, i) => (i === idx ? value : v)));
  // };

  const addVariantValue = () => {
    const val = variantInput.trim();
    if (val && !variantValues.includes(val)) {
      setVariantValues((prev) => [...prev, val]);
      setVariantInput("");
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
    setVariantValues((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(variantValues, "variantValues");

    if (hasVariant && variantValues.length === 0) {
      toast.error("กรุณาเพิ่มอย่างน้อย 1 ตัวเลือก Variant");
      return;
    }

    const productData = { ...form }; // copy state

    console.log(productData, "productData");

    if (hasVariant) {
      productData.variants = variantValues
        .filter((v) => v.trim() !== "")
        .map((v) => {
          // หา _id เดิมจาก productData.variants (ต้องแน่ใจว่าเป็น array ของ object)
          const old = Array.isArray(productData.variants)
            ? productData.variants.find((ov) => ov.value === v)
            : undefined;
          return {
            _id: old?._id, // ถ้ามี _id เดิมก็ใส่
            name: variantGroup,
            value: v,
            image: old?.image ?? "",
            price: old?.price ?? 0,
            stock: old?.stock ?? 0,
            variants: old?.variants ?? [],
          };
        });

      delete productData.image;
      delete productData.price;
      delete productData.stock;
    } else {
      delete productData.variants;
    }

    let responseProduct: ProductBase | null = null;

    if (mode === "edit") {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${form._id}`,
        {
          method: "PUT",
          body: JSON.stringify(productData),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!res.ok) {
        // handle error
        toast.error("Update failed");
        return;
      }
      responseProduct = await res.json();
    } else {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        body: JSON.stringify(productData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        // handle error
        toast.error("Add failed");
        return;
      }
      responseProduct = await res.json();
    }

    onSuccess?.(responseProduct!);
  };

  const categories = Object.values(ProductCategory).filter(
    (c) => c !== ProductCategory.allCategory
  );
  const types = Object.values(ProductType).filter(
    (t) => t !== ProductType.allType
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-1">Product Name</label>
        <input
          name="name"
          type="text"
          className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <textarea
          name="description"
          className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block mb-1">Category</label>
        <select
          name="category"
          className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Tags</label>
        <select
          name="type"
          className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
          value={form.type}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
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
        <label htmlFor="hasVariant" className="select-none text-white">
          สินค้านี้มีตัวเลือก (Variant) เช่น สี/ไซส์ ฯลฯ
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
          <label className="block mb-1">Variant Group</label>
          <input
            name="variantGroup"
            type="text"
            className="w-full p-2 rounded text-white border border-gray-600 bg-gray-900"
            value={variantGroup}
            onChange={(e) => setVariantGroup(e.target.value)}
            required
          />

          <label className="block mb-1 mt-3">Variant Value</label>
          {/* tags list */}
          <div className="flex flex-wrap gap-2 mb-2">
            {variantValues.map((val, idx) => (
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
              value={variantInput}
              onChange={(e) => setVariantInput(e.target.value)}
              onKeyDown={handleVariantInputKeyDown}
              placeholder="พิมพ์แล้วกด Enter หรือ +"
            />
            <button
              type="button"
              className="px-3 rounded text-indigo-600 border border-gray-600 bg-gray-900 cursor-pointer"
              onClick={addVariantValue}
              disabled={!variantInput.trim()}
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
          {mode === "edit" ? "Save Changes" : "Add Product"}
        </button>
        <button
          type="button"
          onClick={() => {
            setForm(product ?? initialForm);
            setHasVariant(
              Array.isArray(product?.variants) && product.variants.length > 0
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
