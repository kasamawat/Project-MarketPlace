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
      <div className="flex items-center justify-center">
        <ClientCart />
      </div>
    </div>
  );
}
