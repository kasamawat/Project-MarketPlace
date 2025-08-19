// components/store/StoreFrame.tsx
"use client";

import { useState } from "react";
import StoreSidebar from "@/components/store/StoreSidebar";

export default function StoreFrame({
  storeName,
  children,
}: {
  storeName?: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen((v) => !v);

  return (
    <div className="flex min-h-screen text-gray-100 mx-auto max-w-7xl">
      <div className="w-[20%]">
        {/* Sidebar (desktop - always visible) */}
        <aside className="hidden border-r border-gray-800 md:block px-4 py-6 md:px-6">
          <StoreSidebar
            storeName={storeName}
            // ปุ่ม toggle จะแสดงเฉพาะ mobile อยู่แล้ว (md:hidden)
            onToggle={toggleMobile}
          />
        </aside>

        {/* Sidebar (mobile overlay) */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={toggleMobile}
          />
        )}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-800 bg-gray-900 transition-transform md:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <StoreSidebar
            storeName={storeName}
            onToggle={toggleMobile}
            onNavigate={toggleMobile}
          />
        </aside>
      </div>
      <div className="w-[80%]">
        {/* Content */}
        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
