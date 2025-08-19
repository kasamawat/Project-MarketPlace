import ProductEditor from "@/components/store/products/ProductEditor";
import Link from "next/link";

export default function CreateProductPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* <div className="mb-4">
        <Link
          href="/store/products"
          className="text-sm text-indigo-500 hover:underline"
        >
          ← Back to Product List
        </Link>
      </div> */}

      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

      <ProductEditor mode="add" />
    </main>
  );
}
