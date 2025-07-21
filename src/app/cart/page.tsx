// app/cart/page.tsx
import Breadcrumbs from "@/components/Breadcrumbs";
import ClientCart from "./ClientCart";

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs
          paths={[
            { name: "Home", href: "/", status: "link" },
            { name: "Cart", href: "/cart", status: "link" },
          ]}
        />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-white">Your cart items</h1>
      <ClientCart />
    </div>
  );
}
