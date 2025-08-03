"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { Store } from "@/types/store.types";

export default function BankInfo(): React.ReactElement {
  const store = useStore();

  const [isEditing, setIsEditing] = useState(false); // ✅ new

  // สร้าง state สำหรับเก็บฟิลด์ธนาคาร
  const [form, setForm] = useState<
    Partial<Pick<Store, "bankName" | "bankAccountNumber" | "bankAccountName">>
  >({
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  // โหลดค่าจาก store มายัง form ตอน store เปลี่ยน
  useEffect(() => {
    if (store) {
      setForm({
        bankName: store.bankName || "",
        bankAccountNumber: store.bankAccountNumber || "",
        bankAccountName: store.bankAccountName || "",
      });
    }
  }, [store]);

  // ฟังก์ชันจัดการเปลี่ยนแปลง input
  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ตัวอย่าง handleSubmit (ต้องเติม logic เรียก API เพิ่ม)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving bank info", form);
    // TODO: เรียก API ส่งข้อมูล
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-6 bg-gray-900 shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-6">Bank Information</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium">Bank Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            placeholder=""
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Bank Account Number
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.bankAccountNumber}
            onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
            placeholder=""
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Bank Account Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.bankAccountName}
            onChange={(e) => handleChange("bankAccountName", e.target.value)}
            placeholder=""
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
