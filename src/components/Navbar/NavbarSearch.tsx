"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Result = { id: string; name: string; type: "product" | "store" };

const API_BASE = process.env.NEXT_PUBLIC_API_URL; // NestJS base URL

const NavbarSearch: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const dropdownSearchRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownSearchRef.current &&
        !dropdownSearchRef.current.contains(target)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // เรียก suggest แบบ debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const trimmed = value.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!trimmed) {
      setSuggestions([]);
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/search/suggest?q=${encodeURIComponent(trimmed)}`,
          {
            credentials: "include",
            signal,
          }
        );
        if (!res.ok) throw new Error("suggest failed");
        const sugg: string[] = await res.json();
        setSuggestions(sugg);
        setIsSearchOpen(true);

        // ยิงค้นหารายการ “ตัวอย่างผลลัพธ์” (optional preview) — ดึง products/stores อย่างละนิด
        const res2 = await fetch(
          `${API_BASE}/search?q=${encodeURIComponent(
            trimmed
          )}&type=all&page=1&limit=6`,
          { credentials: "include", signal }
        );
        if (res2.ok) {
          const data = await res2.json();
          const items: Result[] = [
            ...(data.stores?.items ?? []).map((s: any) => ({
              id: String(s.storeId ?? s.id ?? s._id),
              name: s.name,
              type: "store" as const,
            })),
            ...(data.products?.items ?? []).map((p: any) => ({
              id: String(p.productId ?? p.id ?? p._id),
              name: p.name,
              type: "product" as const,
            })),
          ];
          setSearchResults(items);
        } else {
          setSearchResults([]);
        }
      } catch (_e) {
        // เงียบ ๆ เมื่อโดน abort หรือเน็ตล้ม
      } finally {
        setLoading(false);
      }
    }, 250); // debounce ~250ms
  };

  const gotoSearchPage = () => {
    const query = searchTerm.trim();
    if (!query) return;
    const targetUrl = `/search?q=${encodeURIComponent(query)}`;
    const currentUrl =
      pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");
    if (targetUrl === currentUrl) {
      router.refresh();
    } else {
      router.replace(targetUrl);
    }
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      gotoSearchPage();
    } else if (e.key === "ArrowDown") {
      // TODO: โฟกัสรายการถัดไปใน dropdown (ถ้าจะทำคีย์บอร์ดเนวิเกชัน)
    }
  };

  return (
    <div
      className="relative hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-4 rounded-full bg-gray-800 w-80"
      ref={dropdownSearchRef}
    >
      <input
        className="py-2 px-2 w-full bg-transparent outline-none placeholder-gray-500"
        type="text"
        placeholder="ค้นหาสินค้า/ร้าน…"
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => setIsSearchOpen(true)}
        onKeyDown={handleKeyDown}
      />

      <button
        className="cursor-pointer"
        onClick={gotoSearchPage}
        disabled={!searchTerm.trim()}
      >
        {/* ไอคอนค้นหาเหมือนเดิม */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.836 10.615 15 14.695"
            stroke="#7A7B7D"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            clipRule="evenodd"
            d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783"
            stroke="#7A7B7D"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isSearchOpen && (suggestions.length > 0 || searchResults.length > 0) && (
        <div className="absolute top-full mt-1 left-0 w-full bg-gray-900 border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-auto">
          {/* แถบคำแนะนำ (suggest) */}
          {suggestions.length > 0 && (
            <div className="p-2 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">คำแนะนำ</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                    onClick={() => {
                      handleSearchChange(s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ตัวอย่างผลลัพธ์ (preview) */}
          {searchResults.length > 0 && (
            <div className="py-1">
              {searchResults.map((r) => (
                <div
                  key={`${r.type}-${r.id}`}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    setIsSearchOpen(false);
                    if (r.type === "product") router.push(`/products/${r.id}`);
                    else router.push(`/stores/${r.id}`);
                  }}
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-gray-500">({r.type})</span>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="px-4 py-2 text-xs text-gray-400">กำลังค้นหา…</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
