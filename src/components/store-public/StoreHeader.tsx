// components/store/StoreHeader.tsx
import { StorePubilc } from "@/types/store.types";
import Image from "next/image";

export default function StoreHeader({ store }: { store: StorePubilc }) {
  return (
    <div className="grid grid-cols-7 gap-4 border-b pb-4 mb-4">
      <div className="col-span-1 flex flex-col items-center text-md font-medium">
        <Image
          src={store.coverUrl ?? "/default-banner.png"}
          alt={store.name}
          width={100}
          height={100}
          className="object-cover rounded mr-4 ml-4 mt-2 mb-2 border border-solid border-gray-600 rounded-full"
        />
      </div>
      <div className="col-span-2 content-center">
        <h1 className="text-2xl font-bold">{store.name}</h1>
        <p className="text-gray-600">{store.description}</p>
        <p className="text-sm text-gray-400">ผู้ขาย: {store.name}</p>
      </div>
      <div className="col-span-2 content-center">
        <p className="text-gray-600">จำนวนสินค้า: 2</p>
        <p className="text-gray-600">กำลังติดตาม: 1</p>
      </div>
      <div className="col-span-2 content-center">
        <p className="text-gray-600">ผู้ติดตาม: 10k</p>
        <p className="text-gray-600">คะแนน: 4</p>
      </div>
    </div>
  );
}
