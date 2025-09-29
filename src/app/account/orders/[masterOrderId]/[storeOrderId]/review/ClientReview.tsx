"use client";

import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { BuyerOrderDetail } from "@/lib/helpers/orderDetail";
import { useRouter } from "next/navigation";

type Props = { storeOrder: BuyerOrderDetail };

type Draft = {
  rating: number;
  comment: string;
  files: File[];
  submitting?: boolean;
  submitted?: boolean;
  error?: string | null;
};

const MAX_FILES = 5;
const MAX_MB = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const MAX_COMMENT = 1000;

export default function ClientReview({ storeOrder }: Props) {
  const router = useRouter();

  // เลือกเฉพาะร้านแรกตามโครงสร้างเดิม (stores[0])
  const store = storeOrder?.stores[0];

  const isDelivered = store.storeStatus === "DELIVERED";
  const items = store.items ?? [];

  // สินค้าที่อนุญาตให้รีวิว: ต้องเป็นออเดอร์ DELIVERED และ (ยังไม่รีวิว)
  const reviewables = isDelivered
    ? items.filter((it) => !it.reviewed) // ถ้า BE ยังไม่มีฟิลด์ reviewed เอา .filter(()=>true) ไปก่อน
    : [];

  // เก็บ draft per item (productId:skuId เป็น key)
  const [drafts, setDrafts] = React.useState<Record<string, Draft>>({});

  const keyOf = (productId: string, skuId?: string) =>
    `${productId}:${skuId ?? "-"}`;

  const ensureDraft = (k: string) => {
    setDrafts((prev) =>
      prev[k]
        ? prev
        : { ...prev, [k]: { rating: 5, comment: "", files: [] } as Draft }
    );
  };

  const setDraft = (k: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [k]: { ...(prev[k] || {}), ...patch } }));

  const onPickFiles = (k: string, files: FileList | null) => {
    if (!files?.length) return;
    ensureDraft(k);
    const existing = drafts[k]?.files ?? [];
    const next: File[] = [...existing];

    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) {
        toast.error("รองรับไฟล์รูปภาพเท่านั้น");
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`ภาพเกิน ${MAX_MB}MB`);
        continue;
      }
      if (next.length >= MAX_FILES) {
        toast.error(`อัปโหลดได้สูงสุด ${MAX_FILES} รูป`);
        break;
      }
      next.push(f);
    }

    setDraft(k, { files: next });
  };

  const removeFile = (k: string, idx: number) => {
    const cur = drafts[k]?.files ?? [];
    const next = cur.filter((_, i) => i !== idx);
    setDraft(k, { files: next });
  };

  const submitReview = async (k: string, it: (typeof items)[number]) => {
    const d = drafts[k];
    if (!d) return;

    if (!d.rating || d.rating < 1 || d.rating > 5) {
      toast.error("กรุณาให้คะแนน 1–5 ดาว");
      return;
    }
    if (d.comment.length > MAX_COMMENT) {
      toast.error(`ความยาวคอมเมนต์ไม่เกิน ${MAX_COMMENT} ตัวอักษร`);
      return;
    }

    setDraft(k, { submitting: true, error: null });

    const dto = {
      masterOrderId: storeOrder.masterOrderId,
      storeOrderId: store.storeOrderId,
      storeId: store.storeId,
      productId: it.productId,
      skuId: it.skuId,
      rating: d.rating,
      comment: d.comment,
    };

    try {
      const fd = new FormData();
      fd.append("dto", JSON.stringify(dto));
      for (const f of d.files) fd.append("images", f);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews`, // 🔧 ปรับให้ตรง BE ของคุณ
        { method: "POST", credentials: "include", body: fd }
      );

      if (!res.ok) {
        const msg = `ส่งรีวิวไม่สำเร็จ (HTTP ${res.status})`;
        setDraft(k, { error: msg, submitting: false });
        toast.error(msg);
        return;
      }

      setDraft(k, { submitting: false, submitted: true });
      toast.success("ส่งรีวิวเรียบร้อย ขอบคุณมากครับ 🙏");
      router.back();
    } catch (e) {
      setDraft(k, { error: "Network error", submitting: false });
      toast.error("เครือข่ายขัดข้อง ลองใหม่อีกครั้ง");
    }
  };

  if (!isDelivered) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 text-gray-300">
        ออเดอร์นี้ยังไม่อยู่ในสถานะ{" "}
        <span className="font-semibold">DELIVERED</span> จึงยังไม่สามารถรีวิวได้
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Write a Review</h2>
          <p className="text-sm text-gray-400">
            Order #{store.storeOrderId} •{" "}
            {new Date(storeOrder.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Reviewable items */}
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 px-4 py-3 font-semibold">
          Items to Review
        </div>
        {reviewables.length === 0 ? (
          <div className="p-6 text-gray-400">
            ไม่มีสินค้าให้รีวิว (อาจรีวิวครบแล้ว)
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {reviewables.map((it) => {
              const k = keyOf(String(it.productId), String(it.skuId));
              const d = drafts[k] || { rating: 5, comment: "", files: [] };
              return (
                <li key={k} className="p-4">
                  <div className="flex gap-4">
                    <Image
                      src={it?.cover?.url || "/no-image.png"}
                      alt={it.productName}
                      width={112}
                      height={112}
                      className="h-28 w-28 rounded object-cover border border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {it.productName}
                      </div>
                      {it.attributes &&
                        Object.keys(it.attributes).length > 0 && (
                          <div className="text-xs text-gray-400 truncate max-w-[48ch]">
                            {Object.entries(it.attributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")}
                          </div>
                        )}

                      {/* Rating */}
                      <div className="mt-3 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => {
                              ensureDraft(k);
                              setDraft(k, { rating: n });
                            }}
                            className="cursor-pointer"
                            title={`${n} star${n > 1 ? "s" : ""}`}
                          >
                            <Star filled={n <= (d.rating || 0)} />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-400">
                          {d.rating ?? 0}/5
                        </span>
                      </div>

                      {/* Comment */}
                      <div className="mt-3">
                        <textarea
                          value={d.comment}
                          onChange={(e) => {
                            ensureDraft(k);
                            setDraft(k, {
                              comment: e.target.value.slice(0, MAX_COMMENT),
                            });
                          }}
                          rows={3}
                          placeholder="เล่าประสบการณ์ใช้งาน เช่น คุณภาพสินค้า ความรวดเร็วในการจัดส่ง ฯลฯ"
                          className="w-full rounded border border-gray-700 bg-gray-950 p-2 text-gray-100 focus:border-indigo-600 focus:outline-none"
                        />
                        <div className="mt-1 text-xs text-gray-500 text-right">
                          {d.comment.length}/{MAX_COMMENT}
                        </div>
                      </div>

                      {/* Images */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer rounded border border-dashed border-gray-600 px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-800">
                            เพิ่มรูปภาพ
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => onPickFiles(k, e.target.files)}
                            />
                          </label>
                          <span className="text-xs text-gray-500">
                            สูงสุด {MAX_FILES} รูป, รูปละ ≤ {MAX_MB}MB
                          </span>
                        </div>

                        {d.files?.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {d.files.map((f, idx) => {
                              const preview = URL.createObjectURL(f);
                              return (
                                <div key={idx} className="relative">
                                  <Image
                                    src={preview}
                                    alt={f.name}
                                    width={80}
                                    height={80}
                                    className="h-20 w-20 rounded object-cover border border-gray-700"
                                    onLoad={() => URL.revokeObjectURL(preview)}
                                  />
                                  <button
                                    onClick={() => removeFile(k, idx)}
                                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-black/70 text-white text-xs hover:bg-black/90"
                                    title="ลบรูปนี้"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => submitReview(k, it)}
                          disabled={!!d.submitting}
                          className={`rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 cursor-pointer ${
                            d.submitting ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          {d.submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
                        </button>
                        {d.submitted && (
                          <span className="text-xs text-green-400">
                            ส่งเรียบร้อย
                          </span>
                        )}
                        {d.error && (
                          <span className="text-xs text-red-400">
                            {d.error}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* (Option) สรุปร้าน / ปุ่มย้อนกลับ */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/account/orders/${storeOrder.masterOrderId}/${storeOrder.stores[0].storeOrderId}`}
          className="rounded-md border border-gray-600 px-4 py-2 text-gray-100 hover:bg-gray-800"
        >
          Back to Order
        </Link>
      </div>
    </div>
  );
}

/** Star icon */
function Star({ filled }: { filled?: boolean }) {
  return (
    <svg
      className={filled ? "h-5 w-5 fill-yellow-400" : "h-5 w-5"}
      viewBox="0 0 20 20"
      stroke="currentColor"
      strokeWidth="1"
      fill={filled ? "currentColor" : "none"}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.035 3.17a1 1 0 00.95.69h3.332c.969 0 1.371 1.24.588 1.81l-2.696 1.96a1 1 0 00-.364 1.118l1.03 3.175c.3.923-.755 1.688-1.54 1.118L10.9 13.923a1 1 0 00-1.175 0l-2.376 1.764c-.784.57-1.838-.195-1.54-1.118l1.03-3.175a1 1 0 00-.364-1.118L3.78 8.597c-.783-.57-.38-1.81.588-1.81H7.7a1 1 0 00.95-.69l1.035-3.17z" />
    </svg>
  );
}
