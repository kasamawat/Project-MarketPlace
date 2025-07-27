"use client";

import { getAllProducts } from "@/lib/products";
import { getAllStores } from "@/lib/stores";
import { Product } from "@/types/product/product.types";
import { Store } from "@/types/store.types";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Result = { id: string; name: string; type: "product" | "store" };

const NavbarSearch: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Result[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const dropdownSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prod, str] = await Promise.all([
          getAllProducts(),
          getAllStores(),
        ]);
        setProducts(prod);
        setStores(str);
      } catch (error) {
        console.error("Failed to fetch products or stores", error);
      }
    };

    fetchData();
  }, []);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    const trimmed = value.trim();
    if (trimmed === "") {
      setSearchResults([]);
      return;
    }

    const term = trimmed.toLowerCase();

    const matchedStores = stores
      .filter((s) => s.name.toLowerCase().includes(term))
      .map((s) => ({ id: String(s.id), name: s.name, type: "store" as const }));

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(term))
      .map((p) => ({
        id: String(p.id),
        name: p.name,
        type: "product" as const,
      }));

    setSearchResults([...matchedStores, ...matchedProducts]);
    setIsSearchOpen(true);
  };

  const handleSearch = () => {
    const query = searchTerm.trim();
    if (!query) return;

    const targetUrl = `/search?q=${encodeURIComponent(query)}`;
    const currentUrl = pathname + "?" + searchParams.toString();

    if (targetUrl === currentUrl) {
      router.refresh(); // 🔁 reload page if same query
    } else {
      router.replace(targetUrl); // 🚀 navigate to new or same search
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
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
        placeholder="Search ..."
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => setIsSearchOpen(true)}
        onKeyDown={(e) => {
          handleKeyDown(e);
          setIsSearchOpen(false);
        }}
      />

      <button
        className="cursor-pointer"
        onClick={() => {
          if (searchTerm.trim()) {
            handleSearch();
            setIsSearchOpen(false);
          }
        }}
      >
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

      {isSearchOpen && searchResults.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-full bg-gray-900 border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
          {searchResults.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                setSearchTerm(result.name);
                setSearchResults([]);
                setIsSearchOpen(false);

                if (result.type === "product") {
                  router.push(`/products/${result.id}`);
                } else {
                  router.push(`/stores/${result.id}`);
                }
              }}
            >
              <span className="font-medium">{result.name}</span>{" "}
              <span className="text-xs text-gray-500">({result.type})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
