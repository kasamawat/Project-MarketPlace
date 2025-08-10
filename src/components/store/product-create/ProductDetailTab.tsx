import React from "react";
import { ProductCategory } from "@/types/product/enums/product-category.enum";
import { ProductDetailFormInput } from "@/types/product/base/product-base.types";
import { ProductType } from "@/types/product/enums/product-type.enum";
// import { ProductDetailFormInput } from "@/types/product-base.types";

type ProductDetailTabProps = {
  value: ProductDetailFormInput;
  onChange: (v: ProductDetailFormInput) => void;
  onNext: () => void;
};

export default function ProductDetailTab({
  value,
  onChange,
  onNext,
}: ProductDetailTabProps) {
  const categories = Object.values(ProductCategory).filter((c) => c !== "All");
  const types = Object.values(ProductType).filter((t) => t !== "All");

  return (
    <div className="space-y-5">
      <div>
        <label className="block mb-1">
          <span className="text-red-600">*</span>Product Name
        </label>
        <input
          name="name"
          type="text"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block mb-1">Description</label>
        <textarea
          name="description"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={3}
        />
      </div>
      <div>
        <label className="block mb-1">
          <span className="text-red-600">*</span>Category
        </label>
        <select
          name="category"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.category}
          onChange={(e) =>
            onChange({ ...value, category: e.target.value as ProductCategory })
          }
          required
        >
          <option value="">--- Select Category ---</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">
          <span className="text-red-600">*</span>Type (Tag)
        </label>
        <select
          name="type"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.type}
          onChange={(e) =>
            onChange({ ...value, type: e.target.value as ProductType })
          }
          required
        >
          <option value="">--- Select Tags ---</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Image URL</label>
        <input
          name="image"
          type="text"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.image}
          onChange={(e) => onChange({ ...value, image: e.target.value })}
        />
      </div>
      <div className="flex justify-end mt-8">
        <button
          type="button"
          className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700"
          onClick={onNext}
        >
          Next: Manage/Options →
        </button>
      </div>
    </div>
  );
}
