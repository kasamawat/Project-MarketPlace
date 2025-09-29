// app/search/page.tsx
import { getSearchResults } from "@/lib/search/search";
import SearchClient from "./SearchClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { q } = await searchParams;
  const searchTerm = (q ?? "").trim();
  const data = searchTerm ? await getSearchResults(searchTerm) : null;
  console.log(data,"data");
  
  return (
    <SearchClient
      initialTerm={searchTerm}
      initialProducts={data.products} // ส่งทั้งก้อนเข้า client
      initialStores={data.stores}
    />
  );
}
