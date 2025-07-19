"use client";
import { log } from "console";
import Link from "next/link";
import { JSX, use, useEffect, useState } from "react";

export default function Navbar(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
  });

  return (
    <header className={`sticky top-0 z-50 w-full transition-colors duration-300 ${scrolled ? "bg-gray-900/90 shadow-md" : "bg-transparent"}`}>
      <nav className="flex items-center justify-between p-4 md:px-16 lg:px-24 xl:px-32 md:py-6 w-full z-20 relative">
        <Link href="/" className="font-bold text-xl">
          🛒 MyShop
        </Link>

        {/* Desktop Menu */}

        <div className="hidden sm:flex items-center gap-8">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>

          <div className="relative group flex items-center gap-1 cursor-pointer">
            {/* <span className="hover:text-gray-300">Products</span> */}
            <Link className="hover:text-gray-300" href="/products">Products</Link>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path
                d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute bg-slate-900 font-normal flex flex-col gap-2 w-max rounded-lg p-4 top-36 left-0 opacity-0 -translate-y-full group-hover:top-44 group-hover:opacity-100 transition-all duration-300">
              <a
                href="/products/electronics"
                className="hover:translate-x-1 hover:text-slate-500 transition-all"
              >
                Electronic
              </a>
              <a
                href="/products/fashion"
                className="hover:translate-x-1 hover:text-slate-500 transition-all"
              >
                Fashion
              </a>
              <a
                href="/products/furniture"
                className="hover:translate-x-1 hover:text-slate-500 transition-all"
              >
                Furniture
              </a>
            </div>
          </div>

          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>

          <Link href="/contact" className="hover:text-gray-300">
            Contact
          </Link>

          <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
            <input
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
              type="text"
              placeholder="Search products"
            />

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
          </div>

          <div className="relative cursor-pointer">
            <svg
              width="18"
              height="18"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M.583.583h2.333l1.564 7.81a1.17 1.17 0 0 0 1.166.94h5.67a1.17 1.17 0 0 0 1.167-.94l.933-4.893H3.5m2.333 8.75a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0m6.417 0a.583.583 0 1 1-1.167 0 .583.583 0 0 1 1.167 0"
                stroke="#615fff"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <button className="absolute -top-2 -right-3 text-xs text-white bg-indigo-500 w-[18px] h-[18px] rounded-full">
              3
            </button>
          </div>

          <button className="cursor-pointer px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
            Login
          </button>
        </div>

        <button
          onClick={() => (isOpen ? setIsOpen(false) : setIsOpen(true))}
          aria-label="Menu"
          className="sm:hidden"
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

            <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />

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

        {/* Mobile Menu */}

        <div
          className={`${
            isOpen ? "flex" : "hidden"
          } absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}
        >
          <a href="#" className="block">
            Home
          </a>

          <a href="#" className="block">
            About
          </a>

          <a href="#" className="block">
            Contact
          </a>

          <button className="cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm">
            Login
          </button>
        </div>
      </nav>
    </header>
  );
}
