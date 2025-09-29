// lib/search.ts
export async function getSearchResults(term: string) {
    const base = process.env.NEXT_PUBLIC_API_URL!;
    const url = `${base}/search?q=${encodeURIComponent(term)}&type=all&page=1&limit=24`;
    const res = await fetch(url, { cache: "no-store", credentials: "include" });
    if (!res.ok) throw new Error("Search failed");
    return res.json(); // => SearchAllResponse
}
