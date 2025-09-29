"use client";

import { ProductCategory } from "@/types/product/enums/product-category.enum";
import { ProductType } from "@/types/product/enums/product-type.enum";
import {
  ProductDetailFormInput,
  ProductEditorState,
  SkuRow,
} from "@/types/product/products.types";
// import { ProductStatus, SkuInput } from "@/types/product/products.types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ManageProductTab from "../product-create/ManageProductTab";
import ProductDetailTab from "../product-create/ProductDetailTab";
import { toUpdatePayload, toCreatePayload } from "@/lib/helpers/state-payload";
import { diffSkus } from "@/lib/helpers/productEdit";
import { buildCldUrl } from "@/lib/helpers/store/product/product-helper";
import { normalizeAttributes } from "@/lib/helpers/manageProduct";

type UiImage =
  | {
      kind: "existing";
      imageId: string;
      preview: string;
      role: "cover" | "gallery";
      order: number;
    }
  | { kind: "new"; file: File; preview: string };

type Props = {
  mode: "add" | "edit";
  initialProduct?: ProductEditorState;
};

const makeInitial = (p?: Partial<ProductEditorState>): ProductEditorState => ({
  _id: p?._id ?? "",
  name: p?.name ?? "",
  description: p?.description ?? "",
  image: p?.image ?? "",
  category: p?.category ?? ProductCategory.allCategory,
  type: p?.type ?? ProductType.allType,
  defaultPrice: p?.defaultPrice, // ใช้แทน product.price เดิม
  status: p?.status ?? "draft",
  skus: p?.skus ?? [
    // ค่าเริ่มต้น: base SKU 1 ตัว (สำหรับสินค้าธรรมดา)
    { attributes: {}, price: p?.defaultPrice },
  ],
});

export default function ProductEditor({ mode, initialProduct }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"detail" | "manage">("detail");
  const [product, setProduct] = useState<ProductEditorState>(() =>
    makeInitial(initialProduct)
  );
  const [loading, setLoading] = useState(false);

  const [uiImages, setUiImages] = useState<UiImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<Set<string>>(
    new Set()
  );

  // for sku
  const [skuImages, setSkuImages] = useState<
    Record<string, { file?: File; preview: string }>
  >({});

  const [skuDeleteImageIds, setSkuDeleteImageIds] = useState<
    Record<string, string | true> // key = normalizedAttributes; value = imageId หรือ true ถ้ายังไม่ทราบ
  >({});

  console.log(skuImages, "skuImages");
  console.log(skuDeleteImageIds, "skuDeleteImageIds");

  const getSkuPreview = (key: string) => skuImages[key]?.preview;

  const onPickSkuImage = (
    key: string,
    file: File,
    prevUrlToRevoke?: string
  ) => {
    if (prevUrlToRevoke?.startsWith("blob:"))
      URL.revokeObjectURL(prevUrlToRevoke);
    const preview = URL.createObjectURL(file);
    
    setSkuImages((m) => ({ ...m, [key]: { file, preview } }));
  };

  const onRemoveLocalSkuImage = (key: string) => {
    const prev = skuImages[key]?.preview;
    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
    setSkuImages((m) => {
      const n = { ...m };
      delete n[key];
      return n;
    });
  };

  const isSkuImageDeleted = (key: string) => Boolean(skuDeleteImageIds[key]);

  const onQueueSkuImageDelete = (key: string, imageId?: string) => {
    // ถ้าไม่มีรูป persisted (ไม่มี imageId) ก็แค่ลบ local preview/file
    if (!imageId) {
      return onRemoveLocalSkuImage(key);
    }

    // มีรูป persisted → คิวลบ (กันซ้ำด้วย)
    setSkuDeleteImageIds((m) => (m[key] ? m : { ...m, [key]: imageId }));
  };

  const onUndoSkuImageDelete = (key: string) => {
    setSkuDeleteImageIds((m) => {
      const n = { ...m };
      delete n[key];
      return n;
    });
  };

  const previews = uiImages.map((x) => x.preview);

  // func for Images
  function handlePickImages(files: File[]) {
    const filtered = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
    );
    const entries: UiImage[] = filtered.map((f) => ({
      kind: "new",
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setUiImages((prev) => [...prev, ...entries]);
  }

  function handleRemoveImage(index: number) {
    setUiImages((prev) => {
      const target = prev[index];
      // ถ้าเป็น preview local ค่อย revoke
      if (
        target.kind === "new" &&
        (target.preview.startsWith("blob:") ||
          target.preview.startsWith("data:"))
      ) {
        URL.revokeObjectURL(target.preview);
      }
      // ถ้าเป็น existing ให้จำ imageId ไว้ลบที่ BE
      if (target.kind === "existing") {
        setRemovedImageIds((s) => new Set(s).add(target.imageId));
      }
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }

  function handleClearImages() {
    setUiImages((prev) => {
      prev.forEach((x) => {
        if (
          x.kind === "new" &&
          (x.preview.startsWith("blob:") || x.preview.startsWith("data:"))
        ) {
          URL.revokeObjectURL(x.preview);
        }
      });
      // ลบทั้งหมดของ existing → push id เข้า removed set
      setRemovedImageIds((s) => {
        const n = new Set(s);
        prev.forEach((x) => {
          if (x.kind === "existing") n.add(x.imageId);
        });
        return n;
      });
      return [];
    });
  }

  const canGoManage = !!product.name && !!product.category && !!product.type;

  const originalSkusRef = useRef<SkuRow[]>(initialProduct?.skus ?? []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!product.name || !product.category || !product.type) {
      toast.error("กรอกข้อมูลให้ครบถ้วน");
      setTab("detail");
      return;
    }

    try {
      setLoading(true);

      const dto =
        mode === "add" ? toCreatePayload(product) : toUpdatePayload(product);

      // ----- เตรียม payload รูป "สินค้า (product)" -----
      const newFiles = uiImages
        .filter((x) => x.kind === "new")
        .map((x) => x.file as File);
      const deleteIds = Array.from(removedImageIds);

      // set cover
      const setCoverImageId =
        uiImages[0]?.kind === "existing" ? uiImages[0].imageId : undefined;

      const fd = new FormData();
      fd.append("dto", JSON.stringify(dto));
      newFiles.forEach((f) => fd.append("images", f)); // add new image
      if (deleteIds.length)
        fd.append("deleteImageIds", JSON.stringify(deleteIds)); // remove image
      if (setCoverImageId) fd.append("setCoverImageId", setCoverImageId); // set cover image

      if (mode === "add") {
        // ---------- CREATE PRODUCT (รวม SKUs แต่ "ยังไม่แนบรูป SKU") ----------
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Create product failed");
        }
        const { id: newProductId } = await res.json();

        // ---------- ส่งรูป SKU (ถ้ามี) ----------
        const uploads = (product.skus ?? [])
          .map((r, i) => {
            const key = normalizeAttributes(r.attributes ?? {});
            const file = skuImages[key]?.file;
            if (!file) return null;
            return { index: i, key, skuId: r._id ?? undefined, file };
          })
          .filter(Boolean) as {
          index: number;
          key: string;
          skuId?: string;
          file: File;
        }[];

        if (uploads.length || Object.values(skuDeleteImageIds).length) {
          const fdSKU = new FormData();

          // ใช้ "uid" แบบเดียวกับฝั่ง EDIT
          const metas: Array<{ uid: string; key: string; skuId?: string }> = [];
          uploads.forEach((u) => {
            const uid = crypto.randomUUID();
            const ext = u.file.name.split(".").pop() || "bin";
            const fname = `uid_${uid}.${ext}`;
            const named = new File([u.file], fname, { type: u.file.type });
            fdSKU.append("skuImages", named);
            metas.push({ uid, key: u.key, skuId: u.skuId });
          });
          fdSKU.append("skuImagesMeta", JSON.stringify(metas));

          const deleteIdsSKU = Object.values(skuDeleteImageIds).filter(
            (v): v is string => typeof v === "string"
          );
          if (deleteIdsSKU.length) {
            fdSKU.append("skuDeleteImageIds", JSON.stringify(deleteIdsSKU));
          }

          const res2 = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/${newProductId}/skus/batch`,
            { method: "PUT", credentials: "include", body: fdSKU }
          );
          if (!res2.ok) {
            const msg = await res2.text().catch(() => "");
            throw new Error(msg || "Upload SKU images failed");
          }
        }

        toast.success("สร้างรายการสำเร็จ!");
        router.push("/store/products");
        router.refresh();
        return;
      } else {
        // ---------- EDIT PRODUCT (ข้อมูล product + รูป product) ----------
        // 1) update product by productId (without SKUs)
        const res1 = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}`,
          {
            method: "PUT",
            credentials: "include",
            // headers: { "Content-Type": "application/json" },
            body: fd, // ไม่รวม skus
          }
        );
        if (!res1.ok) throw new Error(await res1.text());

        // ---------- diff SKUs ----------
        // 2) check SKUs has change ?
        const {
          create,
          update,
          delete: del,
        } = diffSkus(originalSkusRef.current, product.skus ?? []);

        // find new image SKU
        const uploads = (product.skus ?? [])
          .map((r, i) => {
            const key = normalizeAttributes(r.attributes ?? {});
            const file = skuImages[key]?.file;
            if (!file) return null;
            return { index: i, key, skuId: r._id ?? undefined, file };
          })
          .filter(Boolean) as {
          index: number;
          key: string;
          skuId?: string;
          file: File;
        }[];

        if (
          create.length ||
          update.length ||
          del.length ||
          uploads.length ||
          Object.values(skuDeleteImageIds).length
        ) {
          const fdSKU = new FormData();
          fdSKU.append("dto", JSON.stringify({ create, update, delete: del }));

          // ใช้ "uid" กับไฟล์ SKU (เหมือนข้างบน)
          const metas: Array<{ uid: string; key: string; skuId?: string }> = [];
          uploads.forEach((u) => {
            const uid = crypto.randomUUID();
            const ext = u.file.name.split(".").pop() || "bin";
            const fname = `uid_${uid}.${ext}`;
            const named = new File([u.file], fname, { type: u.file.type });
            fdSKU.append("skuImages", named);
            metas.push({ uid, key: u.key, skuId: u.skuId });
          });
          fdSKU.append("skuImagesMeta", JSON.stringify(metas));

          const deleteIdsSKU = Object.values(skuDeleteImageIds).filter(
            (v): v is string => typeof v === "string"
          );
          if (deleteIdsSKU.length) {
            fdSKU.append("skuDeleteImageIds", JSON.stringify(deleteIdsSKU));
          }

          const res2 = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/skus/batch`,
            { method: "PUT", credentials: "include", body: fdSKU }
          );
          if (!res2.ok) throw new Error(await res2.text());
        }

        toast.success("อัปเดตสำเร็จ!");
        router.push("/store/products");
        router.refresh();
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "edit") return;
    const imgs = (initialProduct?.images ?? []).slice();
    // ดึง cover มาไว้หน้า
    imgs.sort(
      (a, b) =>
        (a.role === "cover" ? -1 : 0) - (b.role === "cover" ? -1 : 0) ||
        (a.order ?? 0) - (b.order ?? 0)
    );

    const list: UiImage[] = imgs.map((img) => ({
      kind: "existing",
      imageId: String(img._id), // มั่นใจว่าเป็น string แล้ว
      preview:
        img.url ??
        buildCldUrl(
          img.publicId,
          img.version,
          "f_auto,q_auto,c_fill,w_300,h_300"
        ),
      role: (img.role as "cover" | "gallery") ?? "gallery",
      order: img.order ?? 0,
    }));
    setUiImages(list);
    setRemovedImageIds(new Set());
  }, [mode, initialProduct]);

  useEffect(() => {
    return () => {
      for (const v of Object.values(skuImages)) {
        if (v.preview?.startsWith("blob:")) URL.revokeObjectURL(v.preview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Tabs */}
      <div className="flex border-b mb-8">
        <button
          type="button"
          className={`px-4 py-2 ${
            tab === "detail"
              ? "border-b-2 border-indigo-500 text-indigo-600 font-bold"
              : "text-gray-500"
          }`}
          onClick={() => setTab("detail")}
        >
          Product Detail
        </button>
        <button
          type="button"
          className={`px-4 py-2 ml-4 ${
            tab === "manage"
              ? "border-b-2 border-indigo-500 text-indigo-600 font-bold"
              : "text-gray-500"
          }`}
          disabled={!canGoManage}
          onClick={() => {
            if (!canGoManage) {
              toast.error("กรอกข้อมูลให้ครบถ้วน");
              return;
            }
            setTab("manage");
          }}
        >
          Manage / Options
        </button>
      </div>

      {/* Tab Content */}
      {tab === "detail" && (
        <ProductDetailTab
          value={{
            name: product.name,
            description: product.description,
            image: product.image,
            category: product.category,
            type: product.type,
            defaultPrice: product.defaultPrice, // ← เพิ่ม
            status: product.status, // ถ้ามี field นี้ในฟอร์ม
          }}
          onChange={(detail: ProductDetailFormInput) =>
            setProduct((prev) => ({ ...prev, ...detail }))
          }
          onNext={() => {
            if (!canGoManage) {
              toast.error("กรอกข้อมูลให้ครบถ้วน");
              return;
            }
            setTab("manage");
          }}
          onPickImages={handlePickImages}
          imagePreviews={previews}
          onRemoveImage={handleRemoveImage}
          onClearImages={handleClearImages}
        />
      )}

      {tab === "manage" && (
        <ManageProductTab
          value={{
            skus: product.skus,
            defaultPrice: product.defaultPrice,
            productName: product.name, // ช่วย autogen code (optional)
          }}
          onChange={(manage) => {
            setProduct((prev) => ({ ...prev, ...manage }));
          }}
          onPickSkuImage={onPickSkuImage}
          onRemoveSkuImage={onRemoveLocalSkuImage}
          onQueueSkuImageDelete={onQueueSkuImageDelete}
          onUndoSkuImageDelete={onUndoSkuImageDelete}
          isSkuImageDeleted={isSkuImageDeleted}
          getSkuPreview={getSkuPreview}
          loading={loading}
          onBack={() => setTab("detail")}
        />
      )}

      {/* Footer buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-800 cursor-pointer"
          onClick={() => history.back()}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
