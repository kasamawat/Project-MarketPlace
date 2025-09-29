"use client";

import Image from "next/image";
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

  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = React.useState<File | null>(
    null
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = React.useState<string | null>(
    null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handlePickLogo() {
    if (!isEditing || saving) return;
    fileInputRef.current?.click();
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    // validate เบื้องต้น
    if (!f.type.startsWith("image/")) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ");
      return;
    }
    // (ถ้าต้องการ) limit ขนาด เช่น 2MB
    if (f.size > 2 * 1024 * 1024) {
      toast.error("ไฟล์ใหญ่เกิน 2MB");
      return;
    }
    setSelectedLogoFile(f);
    const url = URL.createObjectURL(f);
    setLogoPreviewUrl(url);
  }

  React.useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

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
          setLogoUrl(data?.logoUrl ?? null); // ⬅️ เพิ่มบรรทัดนี้
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
    setSelectedLogoFile(null);
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const dto = {
        name: form.name?.trim(),
        slug: toSlug(form.slug),
        description: form.description ?? "",
        phone: form.phone ?? "",
        returnPolicy: form.returnPolicy ?? "",
      };
      const fd = new FormData();
      fd.append("dto", JSON.stringify(dto));

      if (selectedLogoFile) {
        fd.append("logo", selectedLogoFile);
      }

      // 1) เซฟข้อมูลข้อความ
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/store/updateInfo`,
        {
          method: "PUT",
          credentials: "include",
          body: fd,
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

      setSelectedLogoFile(null);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);

      toast.success("Store information saved successfully");
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
      <h2 className="mb-6 text-2xl font-semibold text-white border-b-1 pb-1">
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
              <label className="block text-sm font-medium text-white mb-1">
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
              <label className="block text-sm font-medium text-white mb-1">
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
              <label className="block text-sm font-medium text-white mb-1">
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
              <label className="block text-sm font-medium text-white mb-1">
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
              <label className="block text-sm font-medium text-white mb-1">
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
              <label className="block text-sm font-medium text-white mb-1">
                Store Logo
              </label>

              {/* พื้นที่แสดงโลโก้/กล่องเปล่า */}
              <div
                role={isEditing ? "button" : undefined}
                aria-label={isEditing ? "Choose store logo" : undefined}
                onClick={handlePickLogo}
                className={[
                  "group relative mt-2 flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border",
                  isEditing
                    ? "cursor-pointer border-dashed border-indigo-500 hover:bg-gray-800/50"
                    : "cursor-default border-gray-700",
                ].join(" ")}
                title={isEditing ? "Click to choose logo" : undefined}
              >
                {logoPreviewUrl || logoUrl ? (
                  <>
                    <Image
                      src={logoPreviewUrl ?? logoUrl ?? ""}
                      alt="Store logo"
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs font-medium text-white">
                          คลิกเพื่อเลือกโลโก้
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 14.172 3H5zm7 2v4a1 1 0 0 0 1 1h4" />
                    </svg>
                    <p className="mt-1 text-xs text-gray-400">
                      {isEditing ? "คลิกเพื่อเลือกโลโก้" : "ยังไม่มีโลโก้"}
                    </p>
                  </div>
                )}
              </div>

              {/* input file แบบซ่อน ไว้เรียกจาก onClick ด้านบน */}
              <input
                ref={fileInputRef}
                name="logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
                disabled={!isEditing || saving}
              />

              {/* คำแนะนำ/ข้อจำกัดไฟล์ */}
              <p className="mt-2 text-xs text-gray-500">
                รองรับไฟล์ภาพ (แนะนำ &lt; 2MB). เมื่อกด Save
                ระบบจะอัปโหลดโลโก้ใหม่
              </p>
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
