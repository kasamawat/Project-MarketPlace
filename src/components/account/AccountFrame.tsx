// components/account/AccountFrame.tsx
"use client";

import { useState } from "react";
import AccountSidebar from "./AccountSidebar";
import { useUser } from "@/contexts/UserContext";

export default function AccountFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen((v) => !v);

  return (
    <div className="flex min-h-screen text-gray-100 mx-auto max-w-7xl">
      <div className="w-[20%]">
        {/* Sidebar (desktop - always visible) */}
        <aside className="hidden border-r border-gray-800 md:block px-4 py-6 md:px-6">
          <AccountSidebar userName={user?.username} onToggle={toggleMobile} />
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
          <AccountSidebar
            userName={user?.username}
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
