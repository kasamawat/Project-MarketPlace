import { SkuRow } from "@/types/product/products.types";

/** ---------- utils ---------- */
export function normalizeAttributes(attrs: Record<string, string>) {
  const entries = Object.entries(attrs);
  if (entries.length === 0) return "__BASE__";
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v).trim().toUpperCase()}`)
    .join("|");
}

export function buildSkuCode(productName: string | undefined, attrs: Record<string, string>) {
  const base =
    (productName ?? "PRODUCT")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-")
      .replace(/[^A-Z0-9-]/g, "") || "PRODUCT";
  if (Object.keys(attrs).length === 0) return `${base}-BASE`;
  const parts = Object.entries(attrs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}-${String(v).toUpperCase().replace(/\s+/g, "-")}`);
  return [base, ...parts].join("-");
}

type VariantGroup = { name: string; values: string[] };
export function cartesian(groups: VariantGroup[]): Record<string, string>[] {
  if (groups.length === 0) return [{}];
  // ถ้ามีกลุ่มชื่อว่างหรือไม่มีค่า ให้ข้ามกลุ่มนั้น
  const valid = groups.filter((g) => g.name && g.values.length);
  if (valid.length === 0) return [{}];

  return valid.reduce<Record<string, string>[]>((acc, g) => {
    const next: Record<string, string>[] = [];
    for (const row of acc) {
      for (const val of g.values) {
        next.push({ ...row, [g.name]: val });
      }
    }
    return next;
  }, [{}]);
}

export function computeRowspanMatrix(data: string[][]): number[][] {
  // data[r][c] = ค่าที่จะแสดงในคอลัมน์ c ของแถว r (เช่น Color/Size)
  const R = data.length;
  const C = data[0]?.length ?? 0;
  const M = Array.from({ length: R }, () => Array(C).fill(0));

  for (let c = 0; c < C; c++) {
    let r = 0;
    while (r < R) {
      let run = 1;
      // รวมได้ก็ต่อเมื่อ "คอลัมน์ก่อนหน้า" เท่ากันทั้งหมด และคอลัมน์ปัจจุบันเท่ากัน
      for (let r2 = r + 1; r2 < R; r2++) {
        let samePrefix = true;
        for (let pc = 0; pc < c; pc++) {
          if (data[r2][pc] !== data[r][pc]) { samePrefix = false; break; }
        }
        if (!samePrefix || data[r2][c] !== data[r][c]) break;
        run++;
      }
      M[r][c] = run;               // แถวแรกของกลุ่ม = rowSpan เท่า run
      for (let k = r + 1; k < r + run; k++) M[k][c] = 0; // แถวถัดๆ ไป = 0 (ไม่เรนเดอร์)
      r += run;
    }
  }
  return M;
}

// สร้าง groups จาก keys/values ใน skus ที่มีอยู่
export function inferVariantGroupsFromSkus(skus: SkuRow[] | undefined): VariantGroup[] {
  if (!skus?.length) return [{ name: "", values: [] }];

  // รวม key และค่า พร้อมนับความถี่ เพื่อใช้จัดลำดับ key
  const keyFreq = new Map<string, number>();
  const valSet = new Map<string, Set<string>>();

  for (const s of skus) {
    const attrs = s.attributes ?? {};
    for (const [k, v] of Object.entries(attrs)) {
      keyFreq.set(k, (keyFreq.get(k) ?? 0) + 1);
      if (!valSet.has(k)) valSet.set(k, new Set());
      if (v !== undefined && v !== null && `${v}`.trim() !== "") {
        valSet.get(k)!.add(String(v));
      }
    }
  }

  const keys = Array.from(valSet.keys());
  // จัดลำดับ key: พบถี่สุดมาก่อน แล้วเรียงชื่อ A→Z (เดา intent ผู้ใช้ได้ดีสุด)
  keys.sort((a, b) => {
    const df = (keyFreq.get(b) ?? 0) - (keyFreq.get(a) ?? 0);
    return df !== 0 ? df : a.localeCompare(b);
  });

  const groups = keys.map((k) => ({
    name: k,
    values: Array.from(valSet.get(k)!).sort((a, b) => a.localeCompare(b)),
  }));

  // ถ้าไม่พบ key เลย (เช่นเป็น base SKU เดี่ยว)
  return groups.length ? groups : [{ name: "", values: [] }];
}