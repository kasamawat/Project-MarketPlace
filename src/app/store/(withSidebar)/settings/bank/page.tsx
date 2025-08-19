"use client";

import React from "react";
import toast from "react-hot-toast";

type BankForm = {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
};

export default function BankInfo(): React.ReactElement {
  const [form, setForm] = React.useState<BankForm>({
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });
  const [original, setOriginal] = React.useState<BankForm | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // โหลดค่าจาก API (ใช้ credentials: include เพื่อแนบ cookie token อัตโนมัติ)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/store/getStoreSecure`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const next: BankForm = {
          bankName: data?.bankName ?? "",
          bankAccountNumber: data?.bankAccountNumber ?? "",
          bankAccountName: data?.bankAccountName ?? "",
        };
        if (mounted) {
          setForm(next);
          setOriginal(next);
        }
      } catch (e) {
        if (mounted) setError("Failed to load store");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field: keyof BankForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (original) setForm(original);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // 🔧 ปรับ endpoint ให้ตรงกับฝั่ง backend ของคุณ
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/store/updateBank`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const msg = `Save failed (HTTP ${res.status})`;
        throw new Error(msg);
      }

      // ถ้า backend คืนข้อมูลร้านล่าสุดกลับมา
      const updated = await res.json().catch(() => null);
      const next: BankForm = {
        bankName: updated?.bankName ?? form.bankName,
        bankAccountNumber: updated?.bankAccountNumber ?? form.bankAccountNumber,
        bankAccountName: updated?.bankAccountName ?? form.bankAccountName,
      };

      toast.success("Bank information saved successfully");

      setOriginal(next);
      setForm(next);
      setIsEditing(false);
    } catch (e) {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-xl bg-gray-900 p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-semibold">Bank Information</h2>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded border border-red-800 bg-red-900/30 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium">Bank Name</label>
              <input
                type="text"
                className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                  !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                }`}
                value={form.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                placeholder=""
                disabled={!isEditing || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Bank Account Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                  !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                }`}
                value={form.bankAccountNumber}
                onChange={(e) =>
                  handleChange("bankAccountNumber", e.target.value)
                }
                placeholder=""
                disabled={!isEditing || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Bank Account Name
              </label>
              <input
                type="text"
                className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                  !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                }`}
                value={form.bankAccountName}
                onChange={(e) =>
                  handleChange("bankAccountName", e.target.value)
                }
                placeholder=""
                disabled={!isEditing || saving}
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="cursor-pointer rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
