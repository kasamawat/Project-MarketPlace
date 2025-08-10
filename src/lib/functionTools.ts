import { ProductVariantBase } from "@/types/product/base/product-base.types";
import { CATEGORY_CODE_MAP, COLOR_CODE_MAP } from "./colorCodeMap";

export function removeVariantInTree(
  variants: ProductVariantBase[] = [],
  targetId: string | number
): ProductVariantBase[] {
  return variants
    .map((v) => {
      // ลบใน sub-variants ก่อน
      const newVariants = Array.isArray(v.variants)
        ? removeVariantInTree(v.variants, targetId)
        : [];

      // ถ้า id ตรงกับ target → ลบทิ้ง (filter ด้านล่าง)
      if (v._id?.toString() === targetId) return null;

      // ถ้า sub-variants ว่าง
      if (!newVariants || newVariants.length === 0) {
        return {
          ...v,
          variants: [],
          price: 0,
          stock: 0,
          image: "",
        };
      }

      // เหลือ sub-variants
      return {
        ...v,
        variants: newVariants,
      };
    })
    .filter(Boolean) as ProductVariantBase[];
}

export function getAllVariantPrices(variants: ProductVariantBase[] = []): number[] {
  return variants.flatMap(v => [
    ...(typeof v.price === "number" && v.price > 0 ? [v.price] : []),
    ...(v.variants ? getAllVariantPrices(v.variants) : []),
  ]);
}

export function getAllLevelsNamesAndOptions(variants: ProductVariantBase[]): { name?: string; options: ProductVariantBase[] }[] {
  const levels: { name?: string; options: ProductVariantBase[] }[] = [];
  let current = variants;
  while (current && current.length > 0) {
    levels.push({ name: current[0].name, options: current });
    // ไม่สนว่าเลือกอะไร เดินไป tree ซ้ายสุด
    current = current[0].variants ?? [];
  }
  return levels;
}

export function getSelectedLeafVariant(
  variants: ProductVariantBase[],
  selectedOptions: Record<number, string>,
  allLevelsCount: number
): ProductVariantBase | undefined {
  let currentVariants = variants;
  let result: ProductVariantBase | undefined;

  for (let i = 0; i < allLevelsCount; i++) {
    const selectedValue = selectedOptions[i];
    if (!currentVariants) return undefined;
    const found = currentVariants.find(v => v.value === selectedValue);
    if (!found) return undefined;
    result = found;
    currentVariants = found.variants ?? [];
  }
  return result;
}

type Combination = Record<string, string> & { price?: number; stock?: number; _id?: string };

export function extractCombinations(variants: ProductVariantBase[], path: Combination = {}): Combination[] {
  if (!variants || variants.length === 0) return [];
  let results: Combination[] = [];
  for (const v of variants) {

    const current = { ...path, [v.name!]: v.value!, _id: v._id, price: v.price, stock: v.stock };

    if (v.variants && v.variants.length > 0) {
      // recursive ไป branch ถัดไป
      results = results.concat(extractCombinations(v.variants, current));
    } else {
      // leaf node
      results.push(current);
    }
  }
  return results;
}

// helper set value.variant to variantGroups
type VariantGroupSlim = { name: string; values: string[] };
/**
 * แปลง tree ของ variants -> [{ name, values }] โดยเรียงตามระดับ (depth)
 * รองรับหลายชั้น เช่น Color -> Size -> Sex
 */
export function setVariantsToVariantGroups(
  variants?: ProductVariantBase[]
): VariantGroupSlim[] {
  if (!variants || variants.length === 0) return [];

  // เก็บชื่อ group รายระดับ และค่าในแต่ละระดับแบบ unique
  const nameByDepth: (string | undefined)[] = [];
  const valuesByDepth = new Map<number, Set<string>>();

  const visit = (nodes: ProductVariantBase[] | undefined, depth: number) => {
    if (!nodes || nodes.length === 0) return;

    for (const node of nodes) {
      // ตั้งชื่อ group ตามระดับ (ใช้ชื่อแรกที่เจอเพื่อความสม่ำเสมอ)
      if (node.name && nameByDepth[depth] === undefined) {
        nameByDepth[depth] = node.name;
      }

      // เก็บค่าในระดับนั้น (ถ้ามี value)
      if (node.value) {
        const set = valuesByDepth.get(depth) ?? new Set<string>();
        set.add(node.value);
        valuesByDepth.set(depth, set);
      }

      // ลงไปชั้นถัดไป
      if (node.variants && node.variants.length > 0) {
        visit(node.variants, depth + 1);
      }
    }
  };

  visit(variants, 0);

  // สร้างผลลัพธ์ตามลำดับ depth
  return Array.from(valuesByDepth.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([depth, set]) => ({
      name: nameByDepth[depth] ?? `Variant ${depth + 1}`,
      values: Array.from(set),
    }));
}

// helper ฟังก์ชันสร้าง combination ของค่าทุก group
export function getVariantCombinations(groups: VariantGroupSlim[]) {
  if (groups.length === 0) return [];
  return groups.reduce(
    (acc, group) =>
      acc.flatMap((comb) => group.values.map((val) => [...comb, val])),
    [[]] as string[][]
  );
}


// สมมติ combination = [["Red","S"],["Red","M"],["Red","L"],["Blue","S"],["Blue","M"],["Blue","L"]]
// variantGroups = [{ name: "Color", values: ["Red", "Blue"] }, { name: "Size", values: ["S", "M", "L"] }]

export function getRowspanMatrix(
  combinations: string[][],
  nCols: number
): boolean[][] {
  const nRows = combinations.length;
  const result: boolean[][] = [];
  for (let i = 0; i < nRows; i++) {
    result[i] = [];
    for (let j = 0; j < nCols; j++) {
      let show = true;
      if (i > 0) {
        let same = true;
        for (let k = 0; k <= j; k++) {
          if (combinations[i][k] !== combinations[i - 1][k]) {
            same = false;
            break;
          }
        }
        if (same) show = false;
      }
      result[i][j] = show;
    }
  }
  return result;
}

export function getRowspanCount(
  combinations: string[][],
  colIdx: number,
  rowIdx: number
): number {
  const val = combinations[rowIdx][colIdx];
  let count = 1;
  for (
    let i = rowIdx + 1;
    i < combinations.length && combinations[i][colIdx] === val;
    i++
  ) {
    let same = true;
    for (let k = 0; k < colIdx; k++) {
      if (combinations[i][k] !== combinations[rowIdx][k]) {
        same = false;
        break;
      }
    }
    if (!same) break;
    count++;
  }
  return count;
}

export function buildNestedVariants(groups: VariantGroupSlim[], idx = 0): ProductVariantBase[] {
  if (idx >= groups.length) return [];
  const group = groups[idx];

  return group.values.map((v) => {
    const node: ProductVariantBase = {
      _id: "",
      name: group.name,
      value: v,
      image: "",
      stock: 0,
      price: 0,
      variants: []
    };
    // ถ้ายังมี group ต่อไป (children)
    if (idx < groups.length - 1) {
      node.variants = buildNestedVariants(groups, idx + 1);
      delete node.price;
      delete node.stock;
    }
    return node;
  });
}

export function findVariantNode(
  variants: ProductVariantBase[] | undefined,
  groups: string[],  // เช่น ["Color","Size","Sex"]
  combo: string[],   // เช่น ["Red", "S", "Male"]
  level: number = 0
): ProductVariantBase | undefined {
  if (!variants || level >= groups.length) return undefined;
  const node = variants.find((v) => v.value === combo[level]);
  if (!node) return undefined;
  if (level === groups.length - 1) return node;
  return findVariantNode(node.variants, groups, combo, level + 1);
}

// สร้าง SKU จาก path ของ variant (เช่น ["Red","S","Male"])
export function suggestSku(params: {
  productCode: string;      // "TSHIRT"
  attrs: string[];          // ["RED","S","MALE"]
  seq?: number;             // 1,2,3...
}) {
  const clean = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  const setMapAttrs = params.attrs.map(attr => COLOR_CODE_MAP[attr.toLocaleLowerCase()] ?? attr);
  const setMapProduct = CATEGORY_CODE_MAP[params.productCode];

  const parts = [setMapProduct, ...setMapAttrs].map(clean);
  const base = parts.filter(Boolean).join("-");

  console.log(parts, "parts");
  console.log(base, "base");

  return params.seq ? `${base}-${String(params.seq).padStart(3, "0")}` : base;
}

// อัปเดต (patch) node ปลายทางใน tree ตาม path combo เช่น ["Red","S","Male"]
export function updateVariantByPath(
  variants: ProductVariantBase[] | undefined,
  groups: string[],      // เช่น ["Color","Size","Sex"]
  combo: string[],       // เช่น ["Red","S","Male"]
  patch: Partial<ProductVariantBase>, // { price: 123 } หรือ { stock: 5 }
  level = 0
): ProductVariantBase[] | undefined {
  if (!variants) return variants;
  return variants.map(node => {
    if (node.value !== combo[level]) return node;

    if (level === groups.length - 1) {
      // ถึงปลายทาง → แปะ patch
      return { ...node, ...patch };
    }
    // เจาะไปลูกหลานต่อ
    return {
      ...node,
      variants: updateVariantByPath(node.variants, groups, combo, patch, level + 1),
    };
  });
}

// ให้ราคา/สต็อกกับ "ทุก leaf" โดยไม่ mutate
export function applyPriceStockToLeaves(
  variants: ProductVariantBase[] | undefined,
  price: number | undefined,
  stock: number | undefined
): ProductVariantBase[] | undefined {
  if (!variants) return variants;

  const walk = (v: ProductVariantBase): ProductVariantBase => {
    if (v.variants && v.variants.length > 0) {
      return { ...v, variants: v.variants.map(walk) };
    }
    // leaf
    return { ...v, price, stock };
  };

  return variants.map(walk);
}

