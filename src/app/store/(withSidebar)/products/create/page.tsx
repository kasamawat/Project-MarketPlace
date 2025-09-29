import ProductEditor from "@/components/store/products/ProductEditor";
export default function CreateProductPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

      <ProductEditor mode="add" />
    </main>
  );
}
