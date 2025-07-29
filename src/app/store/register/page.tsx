"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    phone: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    productCategory: "",
    returnPolicy: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ถ้าใช้ cookie auth
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
    //   router.push(`/stores/${data.storeId}/dashboard`);
    } else {
      alert("Failed to register store");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register Your Store</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Store Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="slug"
          placeholder="Slug (e.g. my-shop)"
          value={form.slug}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Store Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="bankName"
          placeholder="Bank Name"
          value={form.bankName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="bankAccountNumber"
          placeholder="Bank Account Number"
          value={form.bankAccountNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="bankAccountName"
          placeholder="Bank Account Name"
          value={form.bankAccountName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="productCategory"
          placeholder="Product Category"
          value={form.productCategory}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="returnPolicy"
          placeholder="Return Policy"
          value={form.returnPolicy}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Create Store
        </button>
      </form>
    </div>
  );
}
