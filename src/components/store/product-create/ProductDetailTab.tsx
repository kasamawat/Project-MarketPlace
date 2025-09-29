import React from "react";
import { ProductCategory } from "@/types/product/enums/product-category.enum";
// import { ProductDetailFormInput } from "@/types/product/base/product-base.types";
import { ProductType } from "@/types/product/enums/product-type.enum";
import {
  ProductDetailFormInput,
  ProductStatus,
} from "@/types/product/products.types";
import Image from "next/image";
// import { ProductDetailFormInput } from "@/types/product-base.types";

type ProductDetailTabProps = {
  value: ProductDetailFormInput;
  onChange: (v: ProductDetailFormInput) => void;
  onNext: () => void;
  onPickImages: (file: File[]) => void;
  imagePreviews?: string[];
  onRemoveImage?: (index: number) => void;
  onClearImages?: () => void;
};

export default function ProductDetailTab({
  value,
  onChange,
  onNext,
  onPickImages,
  imagePreviews = [],
  onRemoveImage,
  onClearImages,
}: ProductDetailTabProps) {
  const categories = Object.values(ProductCategory).filter((c) => c !== "All");
  const types = Object.values(ProductType).filter((t) => t !== "All");

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onPickImages(files);
    e.currentTarget.value = ""; // เลือกไฟล์เดิมซ้ำได้
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="block mb-1">
          <span className="text-red-600">*</span> Product Name
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

      {/* Description */}
      <div>
        <label className="block mb-1">Description</label>
        <textarea
          name="description"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.description ?? ""}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block mb-1">
          <span className="text-red-600">*</span> Category
        </label>
        <select
          name="category"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.category}
          onChange={(e) =>
            onChange({
              ...value,
              category: e.target.value as ProductCategory,
            })
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

      {/* Type */}
      <div>
        <label className="block mb-1">
          <span className="text-red-600">*</span> Type (Tag)
        </label>
        <select
          name="type"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.type}
          onChange={(e) =>
            onChange({
              ...value,
              type: e.target.value as ProductType,
            })
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

      {/* ✅ Image Picker (multiple, ยังไม่อัปโหลด) */}
      <div>
        <label className="block mb-2">Product Images</label>

        {/* ปุ่มเลือกไฟล์ */}
        <label className="inline-flex items-center px-3 py-2 rounded border border-gray-600 hover:bg-gray-800 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
          Add images
        </label>

        {/* ปุ่มลบทั้งหมด */}
        {imagePreviews.length > 0 && onClearImages && (
          <button
            type="button"
            className="ml-3 px-3 py-2 rounded border border-gray-600 hover:bg-gray-800 cursor-pointer"
            onClick={onClearImages}
          >
            Remove all
          </button>
        )}

        {/* Grid พรีวิว */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagePreviews.map((src, idx) => {
              const isBlob = src.startsWith("blob:") || src.startsWith("data:");
              return (
                <div key={idx} className="relative">
                  <div className="relative w-full aspect-square overflow-hidden rounded border border-gray-700">
                    <Image
                      src={src}
                      alt={`preview-${idx}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      // เพื่อให้ blob/data URL แสดงได้แน่นอน
                      unoptimized={isBlob}
                    />
                  </div>
                  {onRemoveImage && (
                    <button
                      type="button"
                      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-black/60 hover:bg-black/80 border border-gray-600 cursor-pointer"
                      onClick={() => onRemoveImage(idx)}
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-sm text-gray-400 mt-2">
          รองรับหลายรูป; ยังไม่อัปโหลดจนกว่าจะกด Save (สูงสุดแนะนำ 10MB/ไฟล์)
        </p>
      </div>

      {/* ⭐️ Default Price (แทน price เดิมในระดับสินค้า) */}
      <div>
        <label className="block mb-1">Default Price</label>
        <input
          name="defaultPrice"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.defaultPrice ?? ""} // ว่าง = ""
          onChange={(e) =>
            onChange({
              ...value,
              defaultPrice:
                e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
        />
        <p className="text-sm text-gray-400 mt-1">
          ใช้เป็นราคาพื้นฐาน ถ้า SKU ไหนไม่กำหนดราคาเองจะ fallback มาอันนี้
        </p>
      </div>

      {/* (For Test without Admin) Status */}

      <div>
        <label className="block mb-1">Status</label>
        <select
          name="status"
          className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
          value={value.status ?? "draft"}
          onChange={(e) =>
            onChange({ ...value, status: e.target.value as ProductStatus })
          }
        >
          <option value="draft">draft</option>
          <option value="pending">pending</option>
          <option value="published">published</option>
          <option value="unpublished">unpublished</option>
          <option value="rejected">rejected</option>
        </select>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="button"
          className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 cursor-pointer"
          onClick={onNext}
        >
          Next: Manage/Options →
        </button>
      </div>
    </div>
  );
}
