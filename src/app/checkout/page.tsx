import Breadcrumbs from "@/components/Breadcrumbs";
import ClientCheckOut from "./ClientCheckOut";

export default async function CheckoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        paths={[
          { name: "HOME", href: "/", status: "link" },
          { name: "CHECKOUT", href: "/checkout", status: "disabled" },
        ]}
      />
      <ClientCheckOut/>
    </div>
  );
}
