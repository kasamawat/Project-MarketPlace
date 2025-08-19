// app/store/status/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StoreStatus = "pending" | "approved" | "rejected";

interface StoreData {
  name: string;
  slug: string;
  status: StoreStatus;
}

const statusMap = {
  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: "🕒",
    message: "ร้านค้าของคุณอยู่ระหว่างการตรวจสอบ",
  },
  approved: {
    color: "bg-green-100 text-green-800",
    icon: "✅",
    message: "ร้านค้าของคุณได้รับการอนุมัติแล้ว!",
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: "❌",
    message: "คำขอของคุณถูกปฏิเสธ กรุณาส่งคำขอใหม่อีกครั้ง",
  },
};

export default function StoreStatusPage(): React.ReactElement {
  const [store, setStore] = useState<StoreData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/store/getStore`,
          {
            method: "GET",
            credentials: "include", // สำคัญถ้าใช้ cookie
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch store");
        }

        const data = await res.json();

        setStore(data);
      } catch (err) {
        console.error("Error fetching store:", err);
        setStore(null);
      }
    };

    fetchStore();
  }, []);

  if (!store) return <p className="text-center">กำลังโหลด...</p>;

  const status = statusMap[store.status];

  return (
    <div className="max-w-xl mx-auto p-6 text-center border rounded-lg shadow">
      <div className={`p-4 rounded ${status.color}`}>
        <div className="text-5xl mb-4">{status.icon}</div>
        <h2 className="text-xl font-semibold">{status.message}</h2>
        <p className="text-sm mt-2 text-gray-600">ชื่อร้าน: {store.name}</p>
        {store.status === "approved" && (
          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
            onClick={() => router.push("/store/dashboard")}
          >
            ไปที่หน้าจัดการร้านค้า
          </button>
        )}
        {store.status === "rejected" && (
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => router.push("/store/register")}
          >
            ส่งคำขอใหม่
          </button>
        )}
      </div>
    </div>
  );
}
