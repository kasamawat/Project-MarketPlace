import Image from "next/image";
import HeroBanner from "@/components/HeroBanner";
import RecommendedItems from "@/components/RecommendedItems";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="font-sans">
      <HeroBanner />
      <RecommendedItems/>
      <FeaturedProducts/>
      <Footer/>
    </div>
  );
}
