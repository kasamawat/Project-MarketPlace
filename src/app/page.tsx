import Image from "next/image";
import HeroBanner from "@/components/HeroBanner";
import FeaturedCategories from "@/components/FeaturedCategories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="font-sans">
      <HeroBanner />
      <FeaturedCategories/>
      <FeaturedProducts/>
      <Footer/>
    </div>
  );
}
