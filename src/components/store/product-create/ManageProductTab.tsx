import { useState, useEffect } from "react";
import {
  ManageProductFormInput,
  ProductVariantBase,
} from "@/types/product/base/product-base.types";
import {
  applyPriceStockToLeaves,
  buildNestedVariants,
  findVariantNode,
  getRowspanCount,
  getRowspanMatrix,
  getVariantCombinations,
  setVariantsToVariantGroups,
  suggestSku,
  updateVariantByPath,
} from "@/lib/functionTools";

type ManageProductTabProps = {
  value: ManageProductFormInput;
  onChange: (v: ManageProductFormInput) => void;
  loading?: boolean;
  onBack: () => void;
};

type VariantGroup = { name: string; values: string[] };

const MAX_GROUPS = 5; // ปรับได้ (2 หรือ 3 หรือมากกว่า)

export default function ManageProductTab({
  value,
  onChange,
  loading,
  onBack,
}: ManageProductTabProps) {
  console.log(value, "valuevaluevaluevaluevaluevaluevaluevalue");

  // local state
  const [hasVariant, setHasVariant] = useState(
    Array.isArray(value.variants) && value.variants.length > 0
  );

  const [variantList, setVariantList] = useState<{
    price: number;
    stock: number;
    autoGen: boolean;
  }>({ price: 0, stock: 0, autoGen: false });

  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>(() => {
    const groups = setVariantsToVariantGroups(value.variants);
    return groups.length > 0 ? groups : [{ name: "", values: [] }];
  });

  const [inputValues, setInputValues] = useState<string[]>(() =>
    Array(setVariantsToVariantGroups(value.variants).length || 1).fill("")
  );

  // ให้ inputValues sync กับ variantGroups
  useEffect(() => {
    setInputValues(Array(variantGroups.length).fill(""));
  }, [variantGroups]);

  console.log(variantGroups, "variantGroups");
  console.log(inputValues, "inputValues");

  const combinations = getVariantCombinations(variantGroups);
  // console.log(combinations, "combinations");

  const nCols = variantGroups.filter((g) => g.values.length).length;
  const rowspanMatrix = getRowspanMatrix(combinations, nCols);

  const [sku, setSku] = useState<string[]>(() => combinations.map(() => ""));

  // console.log(sku, "sku");

  // Group
  // ฟังก์ชันเปิด group
  const handleOpenGroup = (idx: number) => {
    setVariantGroups((groups) =>
      groups.map((g, i) => (i === idx ? { ...g } : g))
    );
  };

  // ฟังก์ชันปิด group
  const handleRemoveGroup = (idx: number) => {
    if (variantGroups.length === 1) return;

    const newVariantGroups = variantGroups.filter((_, i) => i !== idx);

    setVariantGroups(newVariantGroups);
    setInputValues((prev) => prev.filter((_, i) => i !== idx));

    // 3. Generate variants ใหม่ และ sync กลับ parent
    const openedGroups = newVariantGroups.filter(
      (g) => g.name && g.values.length
    );

    let variants: ProductVariantBase[] = [];

    if (openedGroups.length === 1) {
      // Single group (ex: สี)
      variants = openedGroups[0].values.map((v) => ({
        _id: "",
        name: openedGroups[0].name,
        value: v,
        image: "",
        stock: 0,
        price: 0,
        variants: [],
      }));
    } else if (openedGroups.length > 1) {
      const nestedVariants = buildNestedVariants(openedGroups);
      variants = nestedVariants;
    }

    onChange({
      ...value,
      variants,
      price: undefined,
      stock: undefined,
    });
  };

  // ADD Group
  const handleAddGroup = () => {
    if (variantGroups.length >= MAX_GROUPS) return; // กัน user เพิ่มเกิน
    setVariantGroups((prev) => [...prev, { name: "", values: [] }]);
    setInputValues((prev) => [...prev, ""]);
  };

  // ฟังก์ชันเพิ่ม option
  const handleAddOption = (groupIdx: number) => {
    const val = inputValues[groupIdx]?.trim();
    if (val && !variantGroups[groupIdx].values.includes(val)) {
      // 1. Update variantGroups (add new value)
      const newVariantGroups = variantGroups.map((g, i) =>
        i === groupIdx ? { ...g, values: [...g.values, val] } : g
      );

      console.log(newVariantGroups, "newVariantGroups");

      setVariantGroups(newVariantGroups);

      // 2. เคลียร์ input
      setInputValues((inputs) =>
        inputs.map((v, i) => (i === groupIdx ? "" : v))
      );

      // 3. Generate variants ใหม่ และ sync กลับ parent
      const openedGroups = newVariantGroups.filter(
        (g) => g.name && g.values.length
      );

      let variants: ProductVariantBase[] = [];

      if (openedGroups.length === 1) {
        // Single group (ex: สี)
        variants = openedGroups[0].values.map((v) => ({
          _id: "",
          name: openedGroups[0].name,
          value: v,
          image: "",
          stock: 0,
          price: 0,
          variants: [],
        }));
      } else if (openedGroups.length > 1) {
        const nestedVariants = buildNestedVariants(openedGroups);
        variants = nestedVariants;
      }

      onChange({
        ...value,
        variants,
        price: undefined,
        stock: undefined,
      });
    }
  };

  // ฟังก์ชันลบ option
  const handleRemoveOption = (groupIdx: number, valIdx: number) => {
    const newVariantGroups = variantGroups.map((g, i) =>
      i === groupIdx
        ? {
            ...g,
            values: g.values.filter((_, j) => j !== valIdx),
          }
        : g
    );

    setVariantGroups(newVariantGroups);
    setInputValues((inputs) => inputs.map((v, i) => (i === groupIdx ? "" : v)));

    // 3. Generate variants ใหม่ และ sync กลับ parent
    const openedGroups = newVariantGroups.filter(
      (g) => g.name && g.values.length
    );

    let variants: ProductVariantBase[] = [];

    if (openedGroups.length === 1) {
      // Single group (ex: สี)
      variants = openedGroups[0].values.map((v) => ({
        _id: "",
        name: openedGroups[0].name,
        value: v,
        image: "",
        stock: 0,
        price: 0,
        variants: [],
      }));
    } else if (openedGroups.length > 1) {
      const nestedVariants = buildNestedVariants(openedGroups);
      variants = nestedVariants;
    }

    onChange({
      ...value,
      variants,
      price: undefined,
      stock: undefined,
    });
  };

  // handle change hasVariant
  const handleHasVariantChange = (checked: boolean) => {
    setHasVariant(checked);
    if (!checked) {
      onChange({
        ...value,
        variants: [],
        price: 0,
        stock: 0,
      });
    } else {
      onChange({
        ...value,
        variants: [],
        price: undefined,
        stock: undefined,
      });
    }
  };

  const handleGenerateVariant = () => {
    onChange({
      ...value,
      variants: applyPriceStockToLeaves(
        value.variants,
        variantList.price,
        variantList.stock
      ),
    });

    if (variantList.autoGen) {
      setSku(
        combinations.map((combo, idx) =>
          suggestSku({
            productCode: value.category,
            attrs: combo,
            seq: idx + 1,
          })
        )
      );
    }
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <button
          type="button"
          className={`relative w-12 h-7 transition rounded-full cursor-pointer ${
            hasVariant ? "bg-indigo-600" : "bg-gray-400"
          } focus:outline-none`}
          aria-pressed={hasVariant}
          onClick={() => handleHasVariantChange(!hasVariant)}
          id="hasVariant"
          tabIndex={0}
        >
          <span
            className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition
              ${hasVariant ? "translate-x-5" : ""}
            `}
            style={{ transition: "transform 0.2s" }}
          />
        </button>
        <label
          htmlFor="hasVariant"
          className="ml-3 select-none text-white cursor-pointer"
        >
          Enable Variant
        </label>
      </div>

      {!hasVariant && (
        <>
          <div className="flex mb-4">
            <div className="basis-[10%] content-center">
              <label className="block mr-4">Price (THB)</label>
            </div>
            <div className="basis-[90%] content-center">
              <input
                type="number"
                className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
                value={value.price ?? ""}
                onChange={(e) =>
                  onChange({ ...value, price: Number(e.target.value) })
                }
                min={0}
                step={1}
                required
              />
            </div>
          </div>
          <div className="flex mb-4">
            <div className="basis-[10%] content-center">
              <label className="block mr-4">Stock</label>
            </div>
            <div className="basis-[90%] content-center">
              <input
                type="number"
                className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white"
                value={value.stock ?? ""}
                onChange={(e) =>
                  onChange({ ...value, stock: Number(e.target.value) })
                }
                min={0}
                step={1}
                required
              />
            </div>
          </div>
        </>
      )}
      {hasVariant && (
        <>
          <div className="flex mb-4">
            <div className="basis-[10%]">
              <label className="block mr-4">Variants</label>
            </div>
            <div className="basis-[90%]">
              <div className="w-full mb-4 flex flex-col gap-4">
                {/* วนทุกรอบของ variant group (รองรับหลาย group เช่น Color, Size) */}

                {variantGroups.map((group, idx) => (
                  <div
                    key={idx}
                    className="border bg-gray-900 rounded relative mb-2"
                    style={{
                      minHeight: "60px",
                    }}
                  >
                    <div className="flex border p-4 bg-gray-900 rounded relative">
                      <p className="mr-4 font-semibold">{`Variant ${
                        idx + 1
                      }`}</p>
                      <div className="flex-1 mr-4">
                        <div className="flex mb-3 items-center">
                          <label className="block mr-2 font-medium">
                            Name:
                          </label>
                          <input
                            type="text"
                            className="w-40 p-2 rounded border border-gray-600 bg-gray-900 text-white"
                            value={group.name}
                            onChange={(e) => {
                              setVariantGroups((vs) =>
                                vs.map((g, i) =>
                                  i === idx ? { ...g, name: e.target.value } : g
                                )
                              );
                            }}
                          />
                          {variantGroups.length > 1 && (
                            <button
                              type="button"
                              className="ml-3 px-3 py-1 rounded bg-red-700 text-white hover:bg-red-800 cursor-pointer"
                              onClick={() => handleRemoveGroup(idx)}
                              title="ลบกลุ่มนี้"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <label className="block mr-2 font-medium">
                              Options:
                            </label>
                            <input
                              type="text"
                              className="w-52 p-2 rounded text-white border border-gray-600 bg-gray-900 mr-2"
                              value={inputValues[idx] || ""}
                              onChange={(e) =>
                                setInputValues((inputs) =>
                                  inputs.map((v, i) =>
                                    i === idx ? e.target.value : v
                                  )
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddOption(idx);
                                }
                              }}
                              placeholder="พิมพ์ตัวเลือก เช่น สีแดง แล้วกด +"
                            />
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 mr-4 cursor-pointer"
                              onClick={() => {
                                console.log(variantGroups, "variantGroups");

                                handleAddOption(idx);
                              }}
                              disabled={!inputValues[idx]?.trim()}
                              title="เพิ่มตัวเลือก"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {group.values.map((val, valIdx) => (
                              <span
                                key={valIdx}
                                className="flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium select-none"
                              >
                                {val}
                                <button
                                  type="button"
                                  className="ml-2 text-red-500 hover:text-red-700 font-bold cursor-pointer"
                                  onClick={() => {
                                    handleRemoveOption(idx, valIdx);
                                  }}
                                  title="ลบ"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {variantGroups.length < MAX_GROUPS && (
                  <div
                    className="border p-4 bg-gray-900 rounded relative mb-2"
                    style={{
                      minHeight: "60px",
                    }}
                  >
                    <button
                      type="button"
                      className="mt-2 border px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-200 font-semibold cursor-pointer"
                      onClick={handleAddGroup}
                    >
                      + Add Variant {variantGroups.length + 1}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Variant List */}
          <div className="flex mb-4">
            <div className="basis-[10%]">
              <label className="block mr-4">Variants List</label>
            </div>
            <div className="basis-[90%]">
              <div className="w-full mb-4 flex flex-col gap-4">
                <div
                  className="flex items-center gap-4 border p-4 bg-gray-900 rounded relative"
                  style={{
                    minHeight: "60px",
                  }}
                >
                  {/* Price */}
                  <input
                    className="basis-1/2 h-10 px-3 py-1 rounded bg-transparent focus:bg-white/10 
                    focus:border-indigo-500 border border-gray-600 transition text-white 
                    outline-none placeholder-gray-400"
                    value={variantList.price}
                    onChange={(e) => {
                      setVariantList({
                        ...variantList,
                        price: Number(e.target.value),
                      });
                    }}
                    type="number"
                    placeholder="Price"
                  />

                  {/* Stock */}
                  <input
                    className="basis-1/2 h-10 px-3 py-1 rounded bg-transparent focus:bg-white/10 
                    focus:border-indigo-500 border border-gray-600 transition text-white 
                    outline-none placeholder-gray-400"
                    value={variantList.stock}
                    onChange={(e) => {
                      setVariantList({
                        ...variantList,
                        stock: Number(e.target.value),
                      });
                    }}
                    type="number"
                    placeholder="Stock"
                  />

                  {/* Auto Generate SKU */}
                  <div className="basis-1/4 flex items-center gap-2">
                    <input
                      id="genSKU"
                      type="checkbox"
                      checked={variantList.autoGen}
                      onChange={(e) => {
                        setVariantList({
                          ...variantList,
                          autoGen: e.target.checked,
                        });
                      }}
                      className="w-5 h-5 accent-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="genSKU"
                      className="text-white select-none cursor-pointer"
                    >
                      Auto Generate SKU
                    </label>
                  </div>
                  {/* Apply All Button */}
                  <button
                    type="button"
                    className="basis-1/4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
                    text-white rounded font-semibold transition cursor-pointer"
                    onClick={() => {
                      console.log("Apply all clicked");
                      // TODO: ใส่ logic apply all
                      handleGenerateVariant();
                    }}
                  >
                    Apply All
                  </button>
                </div>
              </div>

              <div className="w-full mx-auto">
                {/* Table Stock Detail */}
                <table className="table-fixed w-full border-collapse border border-gray-700">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      {variantGroups.map((group, idx) => (
                        // group.values.length > 0 &&
                        <th
                          key={idx}
                          className="px-4 py-2 border border-gray-700"
                        >
                          {group.name || `Variant ${idx + 1}`}
                        </th>
                      ))}
                      <th className="px-4 py-2 border border-gray-700">
                        <span className="text-red-600">*</span> Price
                      </th>
                      <th className="px-4 py-2 border border-gray-700">
                        <span className="text-red-600">*</span> Stock
                      </th>
                      <th className="px-4 py-2 border border-gray-700">SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinations.map((combo, rowIdx) => {
                      const groups = variantGroups
                        .filter((g) => g.name)
                        .map((g) => g.name);
                      const variantNode = findVariantNode(
                        value.variants,
                        groups,
                        combo
                      );

                      return (
                        <tr key={rowIdx}>
                          {combo.map((val, colIdx) =>
                            rowspanMatrix[rowIdx][colIdx] ? (
                              <td
                                key={colIdx}
                                className="px-4 py-2 border border-gray-700 align-middle"
                                rowSpan={getRowspanCount(
                                  combinations,
                                  colIdx,
                                  rowIdx
                                )}
                              >
                                <span className="font-medium text-white">
                                  {val}
                                </span>
                              </td>
                            ) : null
                          )}
                          <td className="px-4 py-2 border border-gray-700 align-middle">
                            <input
                              className="w-full h-10 px-3 py-1 rounded bg-transparent focus:bg-white/10 focus:border-indigo-500 border border-gray-600 transition text-white outline-none placeholder-gray-400"
                              type="number"
                              value={variantNode?.price}
                              onChange={(e) => {
                                const next =
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value);
                                const nextVariants = updateVariantByPath(
                                  value.variants,
                                  groups,
                                  combo,
                                  { price: next }
                                );
                                onChange({ ...value, variants: nextVariants });
                              }}
                              placeholder="Price"
                            />
                          </td>
                          <td className="px-4 py-2 border border-gray-700 align-middle">
                            <input
                              className="w-full h-10 px-3 py-1 rounded bg-transparent focus:bg-white/10 focus:border-indigo-500 border border-gray-600 transition text-white outline-none placeholder-gray-400"
                              type="number"
                              value={variantNode?.stock}
                              onChange={(e) => {
                                const next =
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value);
                                const nextVariants = updateVariantByPath(
                                  value.variants,
                                  groups,
                                  combo,
                                  { stock: next }
                                );
                                onChange({ ...value, variants: nextVariants });
                              }}
                              placeholder="Stock"
                            />
                          </td>
                          <td className="px-4 py-2 border border-gray-700 align-middle">
                            <input
                              className="w-full h-10 px-3 py-1 rounded bg-transparent focus:bg-white/10 focus:border-indigo-500 border border-gray-600 transition text-white outline-none placeholder-gray-400"
                              type="text"
                              value={sku[rowIdx] || ""}
                              onChange={(e) => {
                                const newSku = [...sku];
                                newSku[rowIdx] = e.target.value.toUpperCase();
                                setSku(newSku);
                              }}
                              placeholder="SKU"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-400 hover:underline px-4 py-2"
        >
          ← กลับไปหน้า รายละเอียด
        </button>
        <button
          // type="button"
          className="bg-indigo-600 px-5 py-2 rounded text-white hover:bg-indigo-700"
          disabled={loading}
          onClick={() => {
            console.log(variantGroups, "variantGroups");
            console.log(value, "value");
          }}
        >
          {loading ? "กำลังบันทึก..." : "บันทึกสินค้า"}
        </button>
      </div>
    </>
  );
}
