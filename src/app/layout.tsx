// app/layout.tsx หรือ app/root-layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ScrollToTop from "../components/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import Navbar from "../components/Navbar/index"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyShop",
  description: "E-commerce by you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          <ScrollToTop />
          <main className="min-h-screen bg-gradient-to-b from-black to-[#1A0033]">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
