"use client";

import React from "react";
import toast from "react-hot-toast";

type StoreForm = {
  name: string;
  slug: string;
  description: string;
  phone: string;
  returnPolicy: string;
};

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function StoreInfo(): React.ReactElement {
  const [form, setForm] = React.useState<StoreForm>({
    name: "",
    slug: "",
    description: "",
    phone: "",
    returnPolicy: "",
  });
  const [original, setOriginal] = React.useState<StoreForm | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // โหลดข้อมูลร้าน (ใช้ cookie จาก browser: credentials: "include")
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/store/getStoreSecure`,
          { method: "GET", credentials: "include", cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const next: StoreForm = {
          name: data?.name ?? "",
          slug: data?.slug ?? "",
          description: data?.description ?? "",
          phone: data?.phone ?? "",
          returnPolicy: data?.returnPolicy ?? "",
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugBlur = () => {
    setForm((prev) => ({ ...prev, slug: toSlug(prev.slug) }));
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
      // 🔧 ปรับ endpoint ให้ตรงกับของคุณ
      // - ถ้าคุณรวม Bank/Info ไว้ endpoint เดียว: ใช้ `/store/update`
      // - หรือแยกเฉพาะ info: `/store/updateInfo`
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/store/updateInfo`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name?.trim(),
            slug: toSlug(form.slug),
            description: form.description ?? "",
            phone: form.phone ?? "",
            returnPolicy: form.returnPolicy ?? "",
          }),
        }
      );
      if (!res.ok) throw new Error(`Save failed (HTTP ${res.status})`);

      const updated = await res.json().catch(() => null);
      const next: StoreForm = {
        name: updated?.name ?? form.name,
        slug: updated?.slug ?? toSlug(form.slug),
        description: updated?.description ?? form.description,
        phone: updated?.phone ?? form.phone,
        returnPolicy: updated?.returnPolicy ?? form.returnPolicy,
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
    <div className="mx-auto flex max-w-4xl flex-col rounded-xl bg-gray-900 p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-semibold text-white">
        Store Information
      </h2>

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
              <label className="block text-sm font-medium text-white">
                Store Name
              </label>
              <input
                name="name"
                type="text"
                className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                  !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                }`}
                value={form.name}
                onChange={handleChange}
                disabled={!isEditing || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Slug
              </label>
              <input
                name="slug"
                type="text"
                className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                  !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                }`}
                value={form.slug}
                onChange={handleChange}
                onBlur={handleSlugBlur}
                disabled={!isEditing || saving}
              />
              <p className="mt-1 text-xs text-gray-400">
                ใช้ a-z, 0-9, และเครื่องหมาย - เท่านั้น
                (แปลงอัตโนมัติเมื่อออกจากช่อง)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Description
              </label>
              <textarea
                name="description"
                className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                  !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                }`}
                rows={3}
                value={form.description}
                onChange={handleChange}
                disabled={!isEditing || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Phone
              </label>
              <input
                name="phone"
                type="text"
                className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                  !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                }`}
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditing || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Return Policy
              </label>
              <textarea
                name="returnPolicy"
                className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                  !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                }`}
                rows={3}
                value={form.returnPolicy}
                onChange={handleChange}
                disabled={!isEditing || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Store Logo
              </label>
              <input
                name="logo"
                type="file"
                className="cursor-pointer rounded border border-gray-700 bg-gray-950 p-2 text-gray-400"
                // disabled
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
                    className="cursor-pointer rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500 disabled:opacity-60"
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
