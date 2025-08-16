import Breadcrumbs from "@/components/Breadcrumbs";
import ProductListClient from "./ProductListClient";
import {
  PublicProductListQuery,
  PublicProductListResponse,
} from "@/types/product/products.types";
import { buildPublicProductsURL } from "@/lib/helpers/url";

export const revalidate = 60; // ISR 60s

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    sort?: "new" | "price_asc" | "price_desc";
    page?: string;
    limit?: string;
  }>;
};

export default async function ProductListPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));
  const limit = Math.min(60, Math.max(1, Number(sp.limit ?? 24)));

  const query: PublicProductListQuery = {
    q: sp.q,
    category: sp.category,
    sort: sp.sort ?? "new",
    page,
    limit,
  };

  const url = buildPublicProductsURL(process.env.NEXT_PUBLIC_API_URL!, query);

  let data: PublicProductListResponse = {
    items: [],
    total: 0,
    page,
    limit,
  };

  try {
    const res = await fetch(url, {
      next: { revalidate: 0 }, // ใช้ ISR
    });
    if (res.ok) {
      data = await res.json();
    }
  } catch {
    // ignore -> แสดง empty
  }

  console.log(data.items, "data.items");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs
          paths={[
            { name: "HOME", href: "/", status: "link" },
            { name: "PRODUCTS", href: "/products", status: "disabled" },
          ]}
        />
      </div>

      <ProductListClient
        products={data.items}
        total={data.total}
        page={data.page}
        limit={data.limit}
        q={query.q}
        category={query.category}
        sort={query.sort}
      />
    </div>
  );
}
