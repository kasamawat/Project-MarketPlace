import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // อนุญาตโหลดรูปจาก Cloudinary
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
