"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

/** ให้ตรงกับสคีมา BE */
type AddressInfo = {
  _id?: string;
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  district?: string; // อำเภอ/เขต
  subDistrict?: string; // ตำบล/แขวง
  province?: string;
  postalCode?: string;
  country?: string;
  note?: string; // โน้ตจากผู้ซื้อ
  isDefault?: boolean; // สถานะ default (optional ฝั่ง FE)
};

export default function AddressPage(): React.ReactElement {
  const router = useRouter();
  const sp = useSearchParams();
  const selectMode = sp.get("select") === "1"; // โหมดเลือกเพื่อนำไปใช้ Checkout
  const returnTo = sp.get("returnTo") ?? "/checkout"; // หน้าที่จะกลับไป

  const [items, setItems] = React.useState<AddressInfo[]>([]);

  console.log(items, "items");

  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isOpenEditor, setIsOpenEditor] = React.useState(false);
  const [editing, setEditing] = React.useState<AddressInfo | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/addresses`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AddressInfo[];
        if (alive) setItems(data ?? []);
      } catch (e) {
        if (alive) setError((e as Error)?.message ?? "Load failed");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openCreate = () => {
    setEditing({
      name: "",
      phone: "",
      line1: "",
      line2: "",
      subDistrict: "",
      district: "",
      province: "",
      postalCode: "",
      country: "TH",
      note: "",
    });
    setIsOpenEditor(true);
  };

  const openEdit = (a: AddressInfo) => {
    setEditing({ ...a });
    setIsOpenEditor(true);
  };

  const closeEditor = () => {
    setIsOpenEditor(false);
    setEditing(null);
  };

  async function saveAddress(addr: AddressInfo) {
    try {
      const isNew = !addr._id;
      const url = isNew
        ? `${process.env.NEXT_PUBLIC_API_URL}/user/addresses`
        : `${process.env.NEXT_PUBLIC_API_URL}/user/addresses/${addr._id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(addr),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Save failed");
      }

      // โหลดใหม่แบบเร็ว ๆ (หรือจะ patch state ก็ได้)
      await refreshList();
      toast.success(isNew ? "Address added" : "Address updated");
      closeEditor();
    } catch (e) {
      toast.error((e as Error)?.message ?? "Save failed");
    }
  }

  async function refreshList() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/addresses`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (res.ok) {
      const data = (await res.json()) as AddressInfo[];
      setItems(data ?? []);
    }
  }

  async function deleteAddress(a: AddressInfo) {
    if (!a._id) return;
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/addresses/${a._id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      setItems((prev) => prev.filter((x) => x._id !== a._id));
      toast.success("Address deleted");
    } catch (e) {
      toast.error((e as Error)?.message ?? "Delete failed");
    }
  }

  async function makeDefault(a: AddressInfo) {
    if (!a._id) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/addresses/${a._id}/default`,
        { method: "PATCH", credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      await refreshList();
      toast.success("Set as default");
    } catch (e) {
      toast.error((e as Error)?.message ?? "Update failed");
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col rounded-xl bg-gray-900 p-6 shadow-md">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2 text-2xl font-semibold text-white">
        {selectMode ? "Select Shipping Address" : "My Addresses"}
        {!selectMode && (
          <button
            onClick={openCreate}
            className="text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          >
            Add Address
          </button>
        )}
      </div>

      <div className="shadow-sm px-4 py-4 bg-gray-900">
        {loading ? (
          <div className="text-gray-300">Loading…</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-gray-300">
            No address yet.{" "}
            {selectMode ? "" : "Click “Add Address” to create one."}
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((a) => (
              <li
                key={a._id}
                className="rounded border border-gray-700 bg-gray-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{a.name || "-"}</span>
                      {a.isDefault && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-gray-300 text-sm">
                      Tel: {a.phone || "-"}
                    </div>
                  </div>
                  {!selectMode && (
                    <div className="flex gap-2">
                      {!a.isDefault && (
                        <button
                          onClick={() => makeDefault(a)}
                          className="text-xs px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(a)}
                        className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAddress(a)}
                        className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-gray-200 text-sm mt-3 space-y-1">
                  {a.line1 && (
                    <div>
                      <span className="font-semibold">Address line 1: </span>
                      {a.line1}
                    </div>
                  )}
                  {a.line2 && (
                    <div>
                      <span className="font-semibold">Address line 2: </span>
                      {a.line2}
                    </div>
                  )}
                  {(a.subDistrict || a.district) && (
                    <div>
                      <span className="font-semibold">
                        District/Sub-district:{" "}
                      </span>
                      {[a.subDistrict, a.district].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {(a.province || a.postalCode) && (
                    <div>
                      <span className="font-semibold">
                        Province / Postal Code:{" "}
                      </span>
                      {[a.province, a.postalCode].filter(Boolean).join(" ")}
                    </div>
                  )}
                  {a.country && (
                    <div>
                      <span className="font-semibold">Country: </span>
                      {a.country}
                    </div>
                  )}
                  {a.note && (
                    <div className="text-gray-400 text-xs mt-2">
                      <span className="font-semibold text-gray-300">
                        Note:{" "}
                      </span>
                      {a.note}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Drawer / Modal แก้ไข/เพิ่มที่อยู่ */}
      {isOpenEditor && editing && (
        <EditorDialog
          initial={editing}
          onCancel={closeEditor}
          onSave={saveAddress}
        />
      )}
    </div>
  );
}

/** ฟอร์ม Address ตาม AddressInfo */
function EditorDialog({
  initial,
  onCancel,
  onSave,
}: {
  initial: AddressInfo;
  onCancel: () => void;
  onSave: (addr: AddressInfo) => Promise<void>;
}) {
  const [form, setForm] = React.useState<AddressInfo>(initial);
  const [saving, setSaving] = React.useState(false);

  const onChange =
    (k: keyof AddressInfo) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [k]: e.target.value }));
    };

  const valid =
    !!form.name &&
    !!form.phone &&
    !!form.line1 &&
    !!form.subDistrict &&
    !!form.district &&
    !!form.province &&
    !!form.postalCode &&
    !!(form.country ?? "TH");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-2xl rounded-lg border border-gray-700 bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-white">
            {form._id ? "Edit Address" : "Add Address"}
          </div>
          <button
            className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={onCancel}
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-white mb-1">Full Name</label>
            <input
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.name ?? ""}
              onChange={onChange("name")}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-1">Phone Number</label>
            <input
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.phone ?? ""}
              onChange={onChange("phone")}
              autoComplete="tel"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-white mb-1">Address line 1</label>
            <input
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.line1 ?? ""}
              onChange={onChange("line1")}
              autoComplete="address-line1"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-white mb-1">Address line 2</label>
            <input
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.line2 ?? ""}
              onChange={onChange("line2")}
              autoComplete="address-line2"
            />
          </div>

          <div>
            <label className="block text-white mb-1">
              Sub-district (ตำบล/แขวง)
            </label>
            <input
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.subDistrict ?? ""}
              onChange={onChange("subDistrict")}
              autoComplete="address-level4"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-1">
              District (อำเภอ/เขต)
            </label>
            <input
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.district ?? ""}
              onChange={onChange("district")}
              autoComplete="address-level3"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-1">Province</label>
            <input
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.province ?? ""}
              onChange={onChange("province")}
              autoComplete="address-level1"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-1">Postal Code</label>
            <input
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.postalCode ?? ""}
              onChange={onChange("postalCode")}
              inputMode="numeric"
              autoComplete="postal-code"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-1">Country</label>
            <select
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              value={form.country ?? "TH"}
              onChange={onChange("country")}
              required
            >
              <option value="TH">Thailand (TH)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-white mb-1">Note to courier</label>
            <textarea
              className="w-full border border-gray-700 p-2 bg-gray-800 text-white rounded"
              rows={3}
              value={form.note ?? ""}
              onChange={onChange("note")}
              placeholder="เช่น ฝากไว้หน้าบ้าน"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            disabled={!valid || saving}
            onClick={async () => {
              try {
                setSaving(true);
                await onSave(form);
              } finally {
                setSaving(false);
              }
            }}
            className={`text-sm px-4 py-2 rounded text-white ${
              valid
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            {form._id ? "Save changes" : "Create address"}
          </button>
        </div>
      </div>
    </div>
  );
}
