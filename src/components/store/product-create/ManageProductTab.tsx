import {
  cartesian,
  normalizeAttributes,
  buildSkuCode,
  computeRowspanMatrix,
  inferVariantGroupsFromSkus,
} from "@/lib/helpers/manageProduct";
import { ManageProductFormInput, SkuRow } from "@/types/product/products.types";
import { useEffect, useMemo, useState } from "react";

type VariantGroup = { name: string; values: string[] };

type ManageProductTabProps = {
  value: ManageProductFormInput;
  onChange: (v: ManageProductFormInput) => void;
  loading?: boolean;
  onBack: () => void;
};

/** ---------- คอมโพเนนต์หลัก ---------- */
export default function ManageProductTab({
  value,
  onChange,
  loading,
  onBack,
}: ManageProductTabProps) {  
  // 1) สถานะ UI: เปิด/ปิดหลาย SKU (ถ้าไม่เปิด => base SKU เดี่ยว)
  const [multi, setMulti] = useState<boolean>(() => {
    const s = value.skus ?? [];
    if (s.length > 1) return true;
    if (s[0] && Object.keys(s[0].attributes ?? {}).length > 0) return true;
    if (s[0]?._id) return true; // ← มี SKU จริงในระบบ
    return false;
  });

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
                  <input
                    className="w-full h-10 px-3 py-1 rounded bg-transparent focus:bg-white/10 focus:border-indigo-500 border border-gray-600 transition text-white outline-none placeholder-gray-400"
                    type="text"
                    value={r.image ?? ""}
                    onChange={(e) =>
                      updateRow(rowIdx, { image: e.target.value || undefined })
                    }
                    placeholder="https://..."
                  />
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
