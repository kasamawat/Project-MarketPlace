"use client";

import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";

type UserForm = {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  gender: string;
  dob: string; // yyyy-mm-dd
};

export default function ProfilePage(): React.ReactElement {
  // const { user } = useUser();

  const [form, setForm] = React.useState<UserForm>({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
  });
  const [original, setOriginal] = React.useState<UserForm | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Avatar เหมือนโลโก้ร้าน (ออปชัน)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] =
    React.useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(
    null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handlePickAvatar() {
    if (!isEditing || saving) return;
    fileInputRef.current?.click();
  }
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error("ไฟล์ใหญ่เกิน 2MB");
      return;
    }
    setSelectedAvatarFile(f);
    const url = URL.createObjectURL(f);
    setAvatarPreviewUrl(url);
  }
  React.useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  // โหลดข้อมูลผู้ใช้
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/getProfileSecure`, // เปลี่ยนให้ตรง endpoint ที่คืน profile ปัจจุบัน
          { method: "GET", credentials: "include", cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const next: UserForm = {
          username: data?.username ?? "",
          email: data?.email ?? "",
          firstname: data?.firstname ?? "",
          lastname: data?.lastname ?? "",
          gender: data?.gender ?? "",
          dob: data?.dob ? new Date(data.dob).toISOString().slice(0, 10) : "",
        };

        if (mounted) {
          setForm(next);
          setOriginal(next);
          setAvatarUrl(data?.avatarUrl ?? null);
        }
      } catch (e) {
        if (mounted) setError("Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (original) setForm(original);
    setIsEditing(false);
    setError(null);
    setSelectedAvatarFile(null);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const dto = {
        username: form.username, // ปกติ username/email ไม่ให้แก้ ถ้าหลังบ้านห้ามก็ไม่ส่ง
        email: form.email,
        firstname: form.firstname,
        lastname: form.lastname,
        gender: form.gender,
        dob: form.dob || null,
      };

      const fd = new FormData();
      fd.append("dto", JSON.stringify(dto));

      if (selectedAvatarFile) {
        fd.append("avatar", selectedAvatarFile); // ชื่อต้องตรงกับ FileInterceptor("avatar")
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/update`, // ให้ฝั่ง BE รองรับ multipart
        { method: "PUT", credentials: "include", body: fd }
      );

      if (!res.ok) {
        let msg = `Update failed (HTTP ${res.status})`;
        try {
          const j = await res.json();
          if (j?.message)
            msg = Array.isArray(j.message)
              ? j.message.join("; ")
              : String(j.message);
        } catch {}
        throw new Error(msg);
      }

      const updated = await res.json().catch(() => null);

      // อัปเดต UI
      if (updated?.avatarUrl) setAvatarUrl(updated.avatarUrl);
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);

      const next: UserForm = {
        username: updated?.username ?? form.username,
        email: updated?.email ?? form.email,
        firstname: updated?.firstname ?? form.firstname,
        lastname: updated?.lastname ?? form.lastname,
        gender: updated?.gender ?? form.gender,
        dob: updated?.dob
          ? new Date(updated.dob).toISOString().slice(0, 10)
          : form.dob,
      };
      setForm(next);
      setOriginal(next);

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (e) {
      setError((e as Error)?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col rounded-xl bg-gray-900 p-6 shadow-md">
      <h2 className="mb-6 border-b border-gray-800 pb-2 text-2xl font-semibold text-white">
        My Profile
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
            {/* Username / Email - read only */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  className="w-full cursor-not-allowed rounded border border-gray-700 bg-gray-800 p-2 text-gray-300 opacity-60"
                  value={form.username}
                  disabled
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full cursor-not-allowed rounded border border-gray-700 bg-gray-800 p-2 text-gray-300 opacity-60"
                  value={form.email}
                  disabled
                />
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  First Name
                </label>
                <input
                  name="firstname"
                  type="text"
                  className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                    !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  value={form.firstname}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Last Name
                </label>
                <input
                  name="lastname"
                  type="text"
                  className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                    !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  value={form.lastname}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Gender
                </label>
                <select
                  name="gender"
                  className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                    !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  value={form.gender}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                >
                  <option value=""> --- Select ---</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Date of Birth
                </label>
                <input
                  name="dob"
                  type="date"
                  className={`w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none ${
                    !isEditing || saving ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  value={form.dob}
                  onChange={handleChange}
                  disabled={!isEditing || saving}
                />
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label className="mb-1 block text-sm font-medium text-white">
                Avatar
              </label>
              <div
                role={isEditing ? "button" : undefined}
                aria-label={isEditing ? "Choose avatar" : undefined}
                onClick={handlePickAvatar}
                className={[
                  "group relative mt-2 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border",
                  isEditing
                    ? "cursor-pointer border-dashed border-indigo-500 hover:bg-gray-800/50"
                    : "cursor-default border-gray-700",
                ].join(" ")}
                title={isEditing ? "Click to choose avatar" : undefined}
              >
                {avatarPreviewUrl || avatarUrl ? (
                  <>
                    <Image
                      src={avatarPreviewUrl ?? avatarUrl ?? ""}
                      alt="Avatar"
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
                        <span className="text-xs font-medium text-white">
                          คลิกเพื่อเลือกภาพ
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
                      <path d="M12 12a5 5 0 1 0-5-5 5.006 5.006 0 0 0 5 5zm0 2c-4.33 0-8 2.17-8 4v1h16v-1c0-1.83-3.67-4-8-4z" />
                    </svg>
                    <p className="mt-1 text-xs text-gray-400">
                      {isEditing ? "คลิกเพื่อเลือกภาพ" : "ยังไม่มีภาพ"}
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={!isEditing || saving}
              />
              <p className="mt-2 text-xs text-gray-500">
                รองรับไฟล์ภาพ (แนะนำ &lt; 2MB). ระบบจะอัปโหลดเมื่อกด Save
              </p>
            </div>

            {/* Actions */}
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
