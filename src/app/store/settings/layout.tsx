// src/app/store/settings/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import { Store } from "@/types/store.types";

const settingsLinks = [
  { name: "Store Info", href: "/store/settings/info", disable: false },
  { name: "Bank Details", href: "/store/settings/bank", disable: false },
  {
    name: "Return Policy",
    href: "/store/settings/return-policy",
    disable: true,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/store/getStoreSecure`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (res.ok) {
          const data = await res.json();
          setStore(data);
        } else {
          console.error("Failed to fetch store data");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchStore();
  }, []);

  return (
    <StoreContext.Provider value={store}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 h-full p-2">
          <aside className="w-64 p-6 border-r">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <nav className="space-y-2">
              {settingsLinks.map((link) =>
                link.disable ? (
                  <span
                    key={link.href}
                    aria-disabled="true"
                    className={`
        block px-4 py-2 rounded opacity-50 pointer-events-none
        ${pathname === link.href ? "bg-indigo-500 text-white" : "text-gray-700"}
        cursor-not-allowed
      `}
                  >
                    {link.name}
                  </span>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
        block px-4 py-2 rounded hover:bg-indigo-300
        ${pathname === link.href ? "bg-indigo-500 text-white" : "text-gray-700"}
      `}
                  >
                    {link.name}
                  </Link>
                )
              )}
            </nav>
          </aside>

          <main className="flex-1 mb-4 p-2">
            {/* Optional: show store data */}
            {/* <pre>{JSON.stringify(store, null, 2)}</pre> */}
            {children}
          </main>
        </div>
      </div>
    </StoreContext.Provider>
  );
}
