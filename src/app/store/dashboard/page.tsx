// app/store/dashboard/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

type StoreData = {
  _id: string;
  name: string;
  slug: string;
  status: "approved" | "pending" | "rejected";
};

export default async function StoreDashboard() {
  // 🍪 ดึง token จาก cookie (middleware จะเช็คสิทธิ์ให้แล้ว)
  const token = (await cookies()).get("token")?.value;

  // 🌐 1. เรียก API เพื่อดึงข้อมูลร้านค้า
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/getStore`, {
    headers: {
      Cookie: `token=${token}`,
    },
    cache: "no-store",
  });

  // 2. ถ้าหา store ไม่เจอ → ไปสมัครร้านใหม่
  if (!res.ok) {
    redirect("/store/register");
  }

  const store: StoreData = await res.json();

  // 3. ถ้าสถานะร้านยังไม่ approved → ไปหน้า status
  if (store.status !== "approved") {
    redirect("/store/status");
  }

  // ✅ 6. ถ้าทุกอย่างผ่านแล้ว แสดง dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col">
        <div className="max-w-6xl p-6 rounded border border-gray-700">
          <h1 className="text-xl font-bold">
            Welcome to {store.name}&apos;s Dashboard
          </h1>
        </div>

        <div className="max-w-6xl p-6 rounded border border-gray-700">
          <h1 className="text-3xl font-bold mb-6">Store Dashboard</h1>

          {/* Overview */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Store Status</h2>
              <p className="mt-2 text-green-600 font-semibold">Approved</p>
            </div>
            <div className="bg-gray-900 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{"Today's Sales"}</h2>
              <p className="mt-2 text-xl font-bold">฿12,345</p>
            </div>
            <div className="bg-gray-900 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Pending Orders</h2>
              <p className="mt-2 text-xl font-bold">5</p>
            </div>
            <div className="bg-gray-900 p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Products</h2>
              <p className="mt-2 text-xl font-bold">20</p>
            </div>
          </section>

          {/* Management Menu */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Manage Your Store</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/store/products"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
              >
                Manage Products
              </Link>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer">
                Orders
              </button>
              <Link
                href="/store/settings/info"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
              >
                Store Info
              </Link>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer">
                Reports
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
            <p>No new notifications</p>
          </section>
        </div>
      </div>
    </div>
  );
}
