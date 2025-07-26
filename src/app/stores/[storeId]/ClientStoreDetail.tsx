import ProductCard from "@/components/ProductCard";
import StoreHeader from "@/components/store/StoreHeader";
import { Product } from "@/types/product/product.types";
import { Store } from "@/types/store.types";

export default function ClientStoreDetail({ store, product }: { store: Store, product: Product[] }) {
    console.log(product,'product');
    
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <StoreHeader store={store} />

      <h2 className="text-xl font-semibold">สินค้าในร้าน</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {product.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
