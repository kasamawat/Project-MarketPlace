"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Settings,
  ClipboardList,
  FileBarChart2,
  ShieldCheck,
  Menu,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";

type IconType = React.ComponentType<{ size?: number; className?: string }>;

type SubItem = {
  href: string;
  label: string;
  icon?: IconType;
  disable?: boolean;
};

type Item = {
  href?: string;
  label: string;
  icon: IconType;
  submenu?: SubItem[];
};

const items: Item[] = [
  { href: "/store/dashboard", label: "Dashboard", icon: Home },
  { href: "/store/products", label: "Products", icon: Package },
  { href: "/store/orders", label: "Orders", icon: ClipboardList },
  {
    href: "/store/settings/info",
    label: "Settings",
    icon: Settings,
    submenu: [
      {
        href: "/store/settings/info",
        label: "StoreInfo",
        icon: Settings,
        disable: false,
      },
      {
        href: "/store/settings/bank",
        label: "BankDetails",
        icon: Settings,
        disable: false,
      },
      {
        href: "/store/settings/return-policy",
        label: "ReturnPolicy",
        icon: Settings,
        disable: true,
      },
    ],
  },
  { href: "/store/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/store/status", label: "Status", icon: ShieldCheck },
];

export default function StoreSidebar({
  storeName,
  onToggle,
  onNavigate,
}: {
  storeName?: string;
  onToggle?: () => void; // ใช้เปิด/ปิดเฉพาะ mobile overlay
  onNavigate?: () => void; // ปิด overlay เมื่อกด link (mobile)
}) {
  const pathname = usePathname();

  // เก็บสถานะเปิด/ปิดของแต่ละเมนูที่มี submenu (key ใช้ label หรือ href ก็ได้)
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // auto-open parent ถ้า path ปัจจุบันอยู่ใน submenu
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const it of items) {
      if (it.submenu && it.submenu.some((s) => pathname.startsWith(s.href))) {
        next[it.label] = true;
      }
    }
    setOpen((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  const toggleSection = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <nav className="flex h-full flex-col">
      {/* Header: mobile (มีปุ่ม) */}
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-3 md:hidden">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="inline-flex items-center justify-center rounded-lg border border-gray-800 p-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <Menu size={18} />
        </button>
        <span className="ml-2 truncate font-semibold">
          {storeName ? `${storeName} • Dashboard` : "Store Dashboard"}
        </span>
      </div>

      {/* Header: desktop */}
      <div className="hidden items-center border-b border-gray-800 px-3 py-3 md:flex">
        <span className="truncate font-semibold">
          {storeName ? `${storeName} • Dashboard` : "Store Dashboard"}
        </span>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-1 p-2">
        {items.map((it) => {
          const hasSub = !!it.submenu?.length;
          const Icon = it.icon;
          const key = it.label; // ใช้ label เป็น key เปิด/ปิด
          const childActive = hasSub
            ? it.submenu!.some((s) => pathname.startsWith(s.href))
            : false;
          const selfActive = it.href
            ? pathname === it.href || pathname.startsWith(it.href)
            : false;
          const active = childActive || selfActive;

          // แถบแม่ (no submenu): เป็น Link ปกติ
          if (!hasSub) {
            return (
              <Link
                key={key}
                href={it.href!}
                onClick={onNavigate}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} />
                <span className="truncate">{it.label}</span>
              </Link>
            );
          }

          // แถบแม่ (has submenu): เป็นปุ่ม toggle
          return (
            <div key={key} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSection(key)}
                aria-expanded={!!open[key]}
                aria-controls={`submenu-${key}`}
                className={[
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="truncate">{it.label}</span>
                </span>
                {open[key] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {/* Submenu */}
              <div
                id={`submenu-${key}`}
                className={open[key] ? "mt-1 space-y-1" : "hidden"}
              >
                {it.submenu!.map((sub) => {
                  const SubIcon = sub.icon ?? Icon;
                  const subActive =
                    pathname === sub.href || pathname.startsWith(sub.href);

                  if (sub.disable) {
                    return (
                      <span
                        key={sub.href}
                        aria-disabled="true"
                        className="ml-8 flex items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-50"
                      >
                        <SubIcon size={16} className="opacity-90" />
                        <span className="truncate">{sub.label}</span>
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onNavigate}
                      className={[
                        "ml-8 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        subActive
                          ? "bg-indigo-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white",
                      ].join(" ")}
                      aria-current={subActive ? "page" : undefined}
                    >
                      <SubIcon size={16} className="opacity-90" />
                      <span className="truncate">{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
