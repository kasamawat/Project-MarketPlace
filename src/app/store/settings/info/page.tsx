"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { Store } from "@/types/store.types";

export default function StoreInfo(): React.ReactElement {
  const store = useStore();

  const [isEditing, setIsEditing] = useState(false); // ✅ new

  // สร้าง type เฉพาะ fields ที่ต้องการจัดการในฟอร์ม
  type StoreInfoFields = Pick<
    Store,
    | "name"
    | "slug"
    | "description"
    | "phone"
    | "productCategory"
    | "returnPolicy"
  >;

  const [form, setForm] = useState<Partial<StoreInfoFields>>({
    name: store?.name || "",
    slug: store?.slug || "",
    description: store?.description || "",
    phone: store?.phone || "",
    productCategory: store?.productCategory || "",
    returnPolicy: store?.returnPolicy || "",
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name,
        slug: store.slug,
        description: store.description,
        phone: store.phone,
        productCategory: store.productCategory,
        returnPolicy: store.returnPolicy,
      });
    }
  }, [store]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit form:", form);
    // TODO: Call API to update store info
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-6 bg-gray-900 shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-white">
        Store Information
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white">
            Store Name
          </label>
          <input
            name="name"
            type="text"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={handleChange}
            placeholder=""
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Slug</label>
          <input
            name="slug"
            type="text"
            className="w-full border p-2 rounded"
            value={form.slug}
            onChange={handleChange}
            placeholder=""
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Description
          </label>
          <textarea
            name="description"
            className="w-full border p-2 rounded"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Phone</label>
          <input
            name="phone"
            type="text"
            className="w-full border p-2 rounded"
            value={form.phone}
            onChange={handleChange}
            placeholder=""
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Product Category
          </label>
          <input
            name="productCategory"
            type="text"
            className="w-full border p-2 rounded"
            value={form.productCategory}
            onChange={handleChange}
            placeholder=""
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Return Policy
          </label>
          <textarea
            name="returnPolicy"
            className="w-full border p-2 rounded"
            rows={3}
            value={form.returnPolicy}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Store Logo
          </label>
          <input
            name="logo"
            type="file"
            className="cursor-pointer border p-2"
            disabled // Optional: handle logo update separately
          />
        </div>
      </div>
      <div className="flex justify-end items-center gap-3 mt-6">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setIsEditing(false);
                if (store) {
                }
              }}
              className="text-sm px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="text-sm px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition cursor-pointer"
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
