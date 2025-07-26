// app/search/page.tsx
import { getSearchResults } from "@/lib/search";
import SearchClient from "./SearchClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { q } = await searchParams;
  const searchTerm = q || "";
  const resultsRaw = await getSearchResults(searchTerm);
  const results = resultsRaw.map(result => ({
    ...result,
    id: String(result.id),
  }));

  return <SearchClient initialTerm={searchTerm} initialResults={results} />;
}
