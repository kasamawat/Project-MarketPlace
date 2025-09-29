import {
  cartesian,
  normalizeAttributes,
  buildSkuCode,
  computeRowspanMatrix,
  inferVariantGroupsFromSkus,
} from "@/lib/helpers/manageProduct";
import { ManageProductFormInput, SkuRow } from "@/types/product/products.types";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

type VariantGroup = { name: string; values: string[] };

type ManageProductTabProps = {
  value: ManageProductFormInput;
  onChange: (v: ManageProductFormInput) => void;
  loading?: boolean;
  onBack: () => void;

  onPickSkuImage: (key: string, file: File, prevUrlToRevoke?: string) => void;
  onRemoveSkuImage: (key: string) => void; // ลบ "ไฟล์ใหม่" ที่เพิ่งเลือก (local only)
  onQueueSkuImageDelete: (key: string, imageId?: string) => void; // ขอ “ลบรูปเดิม” จาก BE
  onUndoSkuImageDelete: (key: string) => void; // ยกเลิกการ mark ลบ
  isSkuImageDeleted: (key: string) => boolean;
  getSkuPreview: (key: string) => string | undefined;
};

/** ---------- คอมโพเนนต์หลัก ---------- */
export default function ManageProductTab({
  value,
  onChange,
  loading,
  onBack,
  onPickSkuImage,
  onRemoveSkuImage,
  onQueueSkuImageDelete,
  onUndoSkuImageDelete,
  isSkuImageDeleted,
  getSkuPreview,
}: ManageProductTabProps) {
  // 1) สถานะ UI: เปิด/ปิดหลาย SKU (ถ้าไม่เปิด => base SKU เดี่ยว)
  const [multi, setMulti] = useState<boolean>(() => {
    const s = value.skus ?? [];
    if (s.length > 1) return true;
    if (s[0] && Object.keys(s[0].attributes ?? {}).length > 0) return true;
    if (s[0]?._id) return true; // ← มี SKU จริงในระบบ
    return false;
  });

  console.log(value.skus, "value.skus");

  const keyOfRow = (r: SkuRow) => normalizeAttributes(r.attributes ?? {});

  const initialGroups: VariantGroup[] = inferVariantGroupsFromSkus(
    value.skus
  ) ?? [{ name: "", values: [] }];

  // 2) กลุ่มตัวเลือก (เหมือน UI เดิม)
  const [groups, setGroups] = useState<VariantGroup[]>(
    () => initialGroups ?? [{ name: "", values: [] }]
  );

  const [inputs, setInputs] = useState<string[]>(() =>
    Array(initialGroups.length).fill("")
  );

  // 3) แถว SKU ที่แสดงในตาราง (derived จาก groups) + เก็บการแก้ไขราคา/skuCode/purchasable
  const [rows, setRows] = useState<SkuRow[]>(() => {
    // ถ้ามี skus จาก parent ให้ใช้เป็นค่าตั้งต้น
    return value.skus?.length
      ? value.skus.map((s) => ({ ...s, purchasable: s.purchasable ?? true }))
      : [{ attributes: {}, price: value.defaultPrice, purchasable: true }];
  });

  // 4) เมื่อเปิด/ปิดโหมดหลาย SKU
  useEffect(() => {
    if (!multi) {
      // กลับเป็น base SKU
      setGroups([{ name: "", values: [] }]);
      setInputs([""]);
      setRows([
        { attributes: {}, price: value.defaultPrice, purchasable: true },
      ]);
    }
  }, [multi]); // eslint-disable-line

  // 5) คำนวณ combinations จาก groups
  const combos = useMemo(() => cartesian(groups), [groups]);

  // 6) sync rows ให้ตรงกับ combinations:
  //    - เก็บค่าราคา/skuCode ที่ผู้ใช้กรอนไว้ โดย match ด้วย normalizedAttributes
  useEffect(() => {
    if (!multi) return; // โหมดเดี่ยวไม่ต้อง sync กับ combos

    const byKey = new Map<string, SkuRow>();
    rows.forEach((r) => byKey.set(normalizeAttributes(r.attributes ?? {}), r));

    const next: SkuRow[] = combos.map((attrs) => {
      const key = normalizeAttributes(attrs);
      const existed = byKey.get(key);
      return (
        existed ?? {
          attributes: attrs,
          price: value.defaultPrice,
          purchasable: true,
        }
      );
    });

    setRows(next);
  }, [combos]); // eslint-disable-line

  // 7) ส่งค่ากลับ parent ทุกครั้งที่ rows/defaultPrice เปลี่ยน
  useEffect(() => {
    onChange({ ...value, skus: rows });
  }, [rows]); // eslint-disable-line

  // คอลัมน์ attribute ที่จะโชว์ (เรียงตาม groups ที่ตั้งไว้)
  const variantCols = useMemo(
    () => groups.filter((g) => g.name).map((g) => g.name),
    [groups]
  );

  // เมทริกซ์ค่าที่จะโชว์ในแต่ละ cell (ตามลำดับ rows ปัจจุบัน)
  const attrMatrix = useMemo(
    () =>
      (rows ?? []).map((r) => variantCols.map((k) => r.attributes?.[k] ?? "")),
    [rows, variantCols]
  );

  // เมทริกซ์ rowSpan
  const rowspanMatrix = useMemo(
    () => computeRowspanMatrix(attrMatrix),
    [attrMatrix]
  );

  /** ---------- handlers: กลุ่ม/ตัวเลือก ---------- */
  const addGroup = () => {
    setGroups((g) => [...g, { name: "", values: [] }]);
    setInputs((i) => [...i, ""]);
  };

  const removeGroup = (idx: number) => {
    const g2 = groups.filter((_, i) => i !== idx);
    setGroups(g2.length ? g2 : [{ name: "", values: [] }]);
    setInputs((i) => i.filter((_, j) => j !== idx));
  };

  const addOption = (groupIdx: number) => {
    const v = (inputs[groupIdx] || "").trim();
    if (!v) return;
    setGroups((gs) =>
      gs.map((g, i) =>
        i === groupIdx && !g.values.includes(v)
          ? { ...g, values: [...g.values, v] }
          : g
      )
    );
    setInputs((a) => a.map((x, i) => (i === groupIdx ? "" : x)));
  };

  const removeOption = (groupIdx: number, valIdx: number) => {
    setGroups((gs) =>
      gs.map((g, i) =>
        i === groupIdx
          ? { ...g, values: g.values.filter((_, j) => j !== valIdx) }
          : g
      )
    );
  };

  /** ---------- handlers: แถว/ราคา/sku ---------- */
  const updateRow = (idx: number, patch: Partial<SkuRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const applyPriceAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, price: value.defaultPrice })));
  };

  const autoGenCodes = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        skuCode: buildSkuCode(value.productName, r.attributes ?? {}),
      }))
    );
  };

  /** ---------- UI ---------- */
  return (
    <div className="space-y-6">
      {/* Toggle หลาย SKU */}
      <div className="flex items-center mb-4">
        <button
          type="button"
          className={`relative w-12 h-7 transition rounded-full cursor-pointer ${
            multi ? "bg-indigo-600" : "bg-gray-400"
          } focus:outline-none`}
          aria-pressed={multi}
          onClick={() => setMulti((v) => !v)}
        >
          <span
            className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition ${
              multi ? "translate-x-5" : ""
            }`}
            style={{ transition: "transform 0.2s" }}
          />
        </button>
        <span className="ml-3 text-white select-none">Multiple SKUs</span>
      </div>

      {/* ส่วนจัดการ Variant Groups (เฉพาะโหมด multi) */}
      {multi && (
        <div className="space-y-3">
          {groups.map((g, idx) => (
            <div key={idx} className="border p-4 bg-gray-900 rounded">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-semibold text-white">{`Variant ${
                  idx + 1
                }`}</span>
                <input
                  className="w-40 p-2 rounded border border-gray-600 bg-gray-900 text-white"
                  placeholder="Name (e.g. Color)"
                  value={g.name}
                  onChange={(e) =>
                    setGroups((gs) =>
                      gs.map((x, i) =>
                        i === idx ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                />
                {groups.length > 1 && (
                  <button
                    type="button"
                    className="ml-3 px-3 py-1 rounded bg-red-700 text-white hover:bg-red-800 cursor-pointer"
                    onClick={() => removeGroup(idx)}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <input
                  className="w-52 p-2 rounded text-white border border-gray-600 bg-gray-900"
                  placeholder="พิมพ์ตัวเลือก เช่น Red แล้วกด +"
                  value={inputs[idx] || ""}
                  onChange={(e) =>
                    setInputs((a) =>
                      a.map((v, i) => (i === idx ? e.target.value : v))
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption(idx);
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer"
                  onClick={() => addOption(idx)}
                  disabled={!inputs[idx]?.trim()}
                >
                  +
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {g.values.map((v, i) => (
                  <span
                    key={`${v}-${i}`}
                    className="flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium"
                  >
                    {v}
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700 font-bold cursor-pointer"
                      onClick={() => removeOption(idx, i)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* แถบควบคุมรวม */}
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Default Price:</span>
          <input
            className="w-32 p-2 rounded border border-gray-600 bg-gray-900 text-white"
            type="number"
            min={0}
            step="0.01"
            value={value.defaultPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                defaultPrice:
                  e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            placeholder="0.00"
          />
        </div>

        <button
          type="button"
          className="px-3 py-2 rounded bg-gray-800 text-indigo-300 hover:bg-gray-700 cursor-pointer"
          onClick={applyPriceAll}
        >
          Apply default price to all
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded bg-gray-800 text-indigo-300 hover:bg-gray-700 cursor-pointer"
          onClick={autoGenCodes}
        >
          Auto-generate SKU codes
        </button>

        <div className="flex-1" />

        {multi && (
          <button
            type="button"
            className="px-3 py-2 rounded bg-gray-800 text-indigo-300 hover:bg-gray-700 cursor-pointer"
            onClick={addGroup}
          >
            + Add Variant
          </button>
        )}
      </div>

      {/* ตาราง SKUs */}
      <div className="w-full overflow-x-auto">
        <table className="table-fixed w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-900 text-white">
              {/* หัวคอลัมน์สำหรับค่าของแต่ละ Variant group */}
              {multi &&
                groups
                  .filter((g) => g.name)
                  .map((g) => (
                    <th
                      key={g.name}
                      className="px-4 py-2 border border-gray-700"
                    >
                      {g.name}
                    </th>
                  ))}
              <th className="px-4 py-2 border border-gray-700">Price</th>
              <th className="px-4 py-2 border border-gray-700">SKU Code</th>
              <th className="px-4 py-2 border border-gray-700">Image URL</th>
              <th className="px-4 py-2 border border-gray-700">Purchasable</th>
              {multi && <th className="px-4 py-2 border border-gray-700"></th>}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, rowIdx) => (
              <tr key={rowIdx}>
                {/* คอลัมน์ Variant (เช่น Color, Size) */}
                {variantCols.map((colName, colIdx) => {
                  const span = rowspanMatrix[rowIdx]?.[colIdx] ?? 1;
                  if (span === 0) return null; // แถวนี้ถูก merge กับข้างบนแล้ว
                  return (
                    <td
                      key={colIdx}
                      rowSpan={span}
                      className="px-4 py-2 border border-gray-700 align-middle"
                    >
                      <span className="text-white">
                        {r.attributes?.[colName] ?? ""}
                      </span>
                    </td>
                  );
                })}

                {/* คอลัมน์ที่แก้ได้รายแถว (Price / SKU / Image / Purchasable / Remove) */}
                <td className="px-2 py-2 border border-gray-700 align-middle">
                  <input
                    className="w-full h-10 px-3 py-1 rounded bg-transparent focus:bg-white/10 focus:border-indigo-500 border border-gray-600 transition text-white outline-none placeholder-gray-400"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder={`default ${value.defaultPrice ?? 0}`}
                    value={r.price ?? ""}
                    onChange={(e) =>
                      updateRow(rowIdx, {
                        price:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="px-2 py-2 border border-gray-700 align-middle">
                  <input
                    className="w-full h-10 px-3 py-1 rounded bg-transparent focus:bg-white/10 focus:border-indigo-500 border border-gray-600 transition text-white outline-none placeholder-gray-400"
                    type="text"
                    value={r.skuCode ?? ""}
                    onChange={(e) =>
                      updateRow(rowIdx, {
                        skuCode: e.target.value || undefined,
                      })
                    }
                    placeholder="(optional)"
                  />
                </td>
                <td className="px-2 py-2 border border-gray-700 align-middle">
                  {(() => {
                    const k = keyOfRow(r);

                    // id รูป persisted ฝั่งเซิร์ฟเวอร์ (ไว้ส่งไปลบ)
                    const imageId = r.cover?._id || r.images?.[0]?._id;

                    // รูป local ล่าสุด (ถ้ามี)
                    const localPrev = getSkuPreview(k);

                    // มีไฟล์ local ไหม
                    const hasLocal =
                      !!localPrev &&
                      (localPrev.startsWith("blob:") ||
                        localPrev.startsWith("data:"));

                    // ถูกมาร์คให้ลบฝั่งเซิร์ฟเวอร์ไหม
                    const marked = isSkuImageDeleted(k);

                    // รูป persisted เดิม
                    const persisted =
                      r.cover?.url || r.images?.[0]?.url || "";

                    // รูปที่จะโชว์: local > (ถ้า marked แล้วไม่มี local → ซ่อน) > persisted
                    const preview = localPrev || (marked ? "" : persisted);

                    // badge text
                    const badgeText = hasLocal
                      ? "Replacing"
                      : marked
                      ? "Marked for delete"
                      : null;

                    const inputId = `sku-file-${rowIdx}`;

                    return preview ? (
                      <div className="relative w-30 h-30 rounded overflow-hidden border border-gray-700 shrink-0 group">
                        {/* badge แจ้ง mark ลบ */}
                        {badgeText && (
                          <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500 text-black">
                            {badgeText}
                          </span>
                        )}

                        {/* รูปพรีวิว */}
                        <Image
                          src={preview}
                          alt="sku preview"
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                          loader={(p) => p.src}
                        />

                        {/* file input ซ่อน */}
                        <input
                          id={inputId}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) {
                              e.currentTarget.value = "";
                              return;
                            }

                            // 1) validate ก่อน
                            if (!f.type.startsWith("image/")) {
                              toast.error("กรุณาเลือกรูปภาพเท่านั้น");
                              e.currentTarget.value = "";
                              return;
                            }
                            if (f.size > 10 * 1024 * 1024) {
                              toast.error("ไฟล์ใหญ่เกิน 10MB");
                              e.currentTarget.value = "";
                              return;
                            }

                            // ให้พ่อเป็นคนตัดสินใจว่าจะคิวลบ persisted หรือแค่ลบ local
                            onQueueSkuImageDelete(k, imageId);

                            // 3) ตั้งรูปใหม่ (onPickSkuImage ควร revoke blob เดิมให้ด้วยหากส่ง preview เดิมไป)
                            onPickSkuImage(k, f, preview);

                            // 4) reset input
                            e.currentTarget.value = "";
                          }}
                        />

                        {/* แถบปุ่มมุมล่างขวา */}
                        <div
                          className="
                            absolute bottom-1 right-1 flex gap-1
                            bg-black/50 backdrop-blur-sm rounded-md p-1
                            text-xs
                            md:opacity-0 md:group-hover:opacity-100 transition
                          "
                        >
                          <label
                            htmlFor={inputId}
                            className="px-2 py-1 rounded bg-white/90 text-gray-900 hover:bg-white cursor-pointer"
                            title="change"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="icon icon-tabler icons-tabler-outline icon-tabler-photo-edit"
                            >
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M15 8h.01" />
                              <path d="M11 20h-4a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v4" />
                              <path d="M4 15l4 -4c.928 -.893 2.072 -.893 3 0l3 3" />
                              <path d="M14 14l1 -1c.31 -.298 .644 -.497 .987 -.596" />
                              <path d="M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97l-3.39 3.42h-3v-3l3.42 -3.39z" />
                            </svg>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              if (hasLocal) {
                                // cancel new image , undo cance; remark del restore old image
                                onRemoveSkuImage(k);
                                onUndoSkuImageDelete(k);
                              } else if (!marked) {
                                // mark ลบรูปเดิม (ต้องมี imageId ถึงจะลบที่ BE ได้จริง)
                                onQueueSkuImageDelete(k, imageId);
                              } else {
                                // ยกเลิกการ mark ลบ
                                onUndoSkuImageDelete(k);
                              }
                            }}
                            className={`px-2 py-1 rounded cursor-pointer ${
                              marked && !hasLocal
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            } text-white hover:opacity-90`}
                            title={
                              marked
                                ? hasLocal
                                  ? "cancel new"
                                  : "undo del"
                                : hasLocal
                                ? "cancel"
                                : "del"
                            }
                          >
                            {hasLocal ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-x"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M18 6l-12 12" />
                                <path d="M6 6l12 12" />
                              </svg>
                            ) : marked ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-back"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M9 11l-4 4l4 4m-4 -4h11a4 4 0 0 0 0 -8h-1" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-trash-x"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M4 7h16" />
                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                <path d="M10 12l4 4m0 -4l-4 4" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <label className="block px-3 py-6 text-center rounded border border-dashed border-gray-600 hover:bg-gray-800 cursor-pointer text-sm text-gray-300">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) onPickSkuImage(k, f);
                              e.currentTarget.value = "";
                            }}
                          />
                          Choose image
                        </label>
                        {/* ถ้าถูก mark ลบและไม่มีพรีวิว ให้ปุ่ม 'ยกเลิกลบ' โผล่ตรง placeholder */}
                        {marked && (
                          <div className="z-10 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                console.log("UNDO DEL");
                                onUndoSkuImageDelete(k);
                              }}
                              className="px-2 py-1 rounded bg-yellow-600 text-black text-xs cursor-pointer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-back"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M9 11l-4 4l4 4m-4 -4h11a4 4 0 0 0 0 -8h-1" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </td>

                <td className="px-2 py-2 border border-gray-700 align-middle text-center">
                  <input
                    type="checkbox"
                    checked={r.purchasable ?? true}
                    onChange={(e) =>
                      updateRow(rowIdx, { purchasable: e.target.checked })
                    }
                    className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  />
                </td>
                {variantCols.length > 0 && (
                  <td className="px-2 py-2 border border-gray-700 align-middle text-center">
                    <button
                      type="button"
                      className="px-2 py-1 text-red-500 hover:text-red-400 cursor-pointer"
                      onClick={() =>
                        setRows((prev) => prev.filter((_, i) => i !== rowIdx))
                      }
                      disabled={loading}
                      title="Remove row"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-sm text-gray-400 mt-2">
          * ถ้าไม่ระบุราคาใน SKU จะใช้ <b>Default Price</b> เป็นค่าแทน
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-400 hover:underline px-4 py-2 cursor-pointer"
        >
          ← กลับไปหน้า รายละเอียด
        </button>
        <button
          // type="submit"
          className="bg-indigo-600 px-5 py-2 rounded text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
          disabled={loading}
          onClick={() => {
            console.log(value, "value");
          }}
        >
          {loading ? "กำลังบันทึก..." : "บันทึกสินค้า"}
        </button>
      </div>
    </div>
  );
}
