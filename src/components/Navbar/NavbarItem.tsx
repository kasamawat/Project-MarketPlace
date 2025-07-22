// components/Navbar/NavbarItem.tsx
"use client";

import Link from "next/link";
import React from "react";

type Props = {
  label: string;
  href: string;
  dropdown?: { name: string; href: string }[];
};

const NavbarItem: React.FC<Props> = ({ label, href, dropdown }) => {
  return dropdown && dropdown.length > 0 ? (
    <div className="relative group">
      <div className="flex items-center gap-1 cursor-pointer">
        <Link href={href} className="hover:text-gray-300">
          {label}
        </Link>
        <svg
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 18 18"
          aria-hidden="true"
          className="text-white"
        >
          <path
            d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Dropdown */}
      <div className="absolute left-0 mt-2 bg-slate-900 font-normal flex flex-col gap-2 w-max rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        {dropdown.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:translate-x-1 hover:text-slate-500 transition-all"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  ) : (
    <Link href={href} className="hover:text-gray-300">
      {label}
    </Link>
  );
};

export default NavbarItem;
