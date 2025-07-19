// src/components/HeroBanner.tsx
'use client';

import { JSX, useState } from "react";

export default function HeroBanner(): JSX.Element {

  return (
    <section className="relative flex flex-col items-center justify-center bg-gradient-to-b from-black to-[#1A0033] text-white min-h-screen text-sm overflow-hidden">
      {/* Hero Headline */}
      <h1 className="text-4xl md:text-6xl text-center font-medium max-w-3xl mt-5 bg-gradient-to-r from-white to-[#748298] text-transparent bg-clip-text">
        All Products
      </h1>
      <p className="text-slate-100 md:text-base max-md:px-2 text-center max-w-xl mt-3">
        A high-performance, serverless Postgres database that helps you ship fast and scale without limits.
      </p>

      {/* CTA */}
      <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 mt-8 rounded-full transition cursor-pointer" onClick={() => window.location.href = '/products'}>
        <span>SHOP NOW</span>
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path d="M4.166 10h11.667M15.833 10l-5.834 5.834M15.833 10L9.999 4.167" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Logos Placeholder */}
      <div className="overflow-hidden w-full relative max-w-5xl mx-auto select-none mt-16">
        <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-[#140029] to-transparent" />
        <div className="marquee-inner flex will-change-transform min-w-[200%]">
          <div className="flex py-4" id="logo-container"></div>
        </div>
        <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-[#140029] to-transparent" />
      </div>
    </section>
  );
}
