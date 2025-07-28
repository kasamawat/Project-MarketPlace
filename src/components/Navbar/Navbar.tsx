// components/Navbar/Navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import NavbarItem from "./NavbarItem";
import NavbarCart from "./NavbarCart";
import NavbarSearch from "./NavbarSearch";
import NavbarAccount from "./NavbarAccount";
import { useUser } from "@/contexts/UserContext";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "Products",
    href: "/products",
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        scrolled ? "bg-gray-900/90 shadow-md" : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between p-4 md:px-16 lg:px-24 xl:px-32 md:py-6 w-full z-20 relative">
        <Link href="/" className="font-bold text-xl">
          🛒 MyShop
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavbarItem key={item.label} label={item.label} href={item.href} />
          ))}
          <NavbarSearch />
          <NavbarCart />

          {user ? (
            <NavbarAccount user={user} onLogout={handleLogout} />
          ) : (
            <Link
              href={"/auth/login"}
              className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="lg:hidden flex gap-5">
          <div>
            <NavbarCart />
          </div>

          <button
            onClick={() => (isOpen ? setIsOpen(false) : setIsOpen(true))}
            aria-label="Menu"
            className="cursor-pointer"
          >
            {/* Menu Icon SVG */}

            <svg
              width="21"
              height="15"
              viewBox="0 0 21 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="21" height="1.5" rx=".75" fill="#426287" />

              <rect
                x="8"
                y="6"
                width="13"
                height="1.5"
                rx=".75"
                fill="#426287"
              />

              <rect
                x="6"
                y="13"
                width="15"
                height="1.5"
                rx=".75"
                fill="#426287"
              />
            </svg>
          </button>
        </div>
        {/* Mobile Menu */}
        <div
          className={` transform transition-transform duration-1000 ease-in-out ${
            isOpen ? "flex translate-x-0" : "hidden translate-x-full"
          } absolute top-0 right-0 w-1/2 bg-gray-900 shadow-md flex-col items-start gap-2 text-sm lg:hidden`}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-0 left-0 -translate-x-2/2 bg-red-500 hover:bg-red-600 text-white w-11 h-11 flex items-center justify-center z-50 cursor-pointer"
          >
            X
          </button>
          <div className="flex items-center text-lg px-3 w-full bg-gray-700">
            <input
              className="p-2 bg-transparent outline-none placeholder-gray-500"
              type="text"
              placeholder="Search products ..."
            />

            <button className="cursor-pointer">
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
          </div>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="mt-2 mb-2 ml-4 mr-4">
              <NavbarItem
                // key={item.label}
                label={item.label.toLocaleUpperCase()}
                href={item.href}
              />
            </div>
          ))}
          <div className="mt-2 mb-2 ml-4 mr-4">
            <Link
              href={"/auth/login"}
              className="cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
