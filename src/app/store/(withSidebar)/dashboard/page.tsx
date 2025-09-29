// app/store/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

type StoreDetail = {
  _id: string;
  name: string;
  slug: string;
  status: "approved" | "pending" | "rejected";
};
type StoreOrders = {
  ordersCount: number;
  orderSucc: number;
  totalEarn: number;
};

type StoreData = {
  storeDetail: StoreDetail;
  storeOrders: StoreOrders;
};

export default async function StoreDashboard() {
  const token = (await cookies()).get("token")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/getStore`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) redirect("/store/register");

  const store: StoreData = await res.json();

  if (store.storeDetail.status !== "approved") redirect("/store/status");

  return (
    // <DashboardShell storeName={store.name}>
    <div className="flex flex-col max-w-full">
      <div className="max-w-6xl rounded border border-gray-700 p-6">
        <h1 className="text-xl font-bold">
          Welcome to {store.storeDetail.name}&apos;s Dashboard
        </h1>
      </div>

      <div className="mt-6 max-w-6xl rounded border border-gray-700 p-6">
        <h1 className="mb-6 text-3xl font-bold">Overview</h1>

        {/* Overview */}
        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded bg-gray-900 p-4 shadow">
            <h2 className="text-lg font-semibold">Orders</h2>
            <p className="mt-2 text-xl font-bold">
              {store.storeOrders.ordersCount}
            </p>
            <span>
              <Link
                href="/store/orders"
                className="cursor-pointer text-sm text-blue-700 hover:text-blue-800 underline"
              >
                Orders
              </Link>
            </span>
          </div>
          <div className="rounded bg-gray-900 p-4 shadow">
            <h2 className="text-lg font-semibold">Successful Delivery</h2>
            <p className="mt-2 text-xl font-bold">
              {store.storeOrders.orderSucc}
            </p>
          </div>
          <div className="rounded bg-gray-900 p-4 shadow">
            <h2 className="text-lg font-semibold">Total Earnings</h2>
            <p className="mt-2 text-xl font-bold">
              ฿{store.storeOrders.totalEarn}
            </p>
          </div>
          <div className="rounded bg-gray-900 p-4 shadow">
            <h2 className="text-lg font-semibold">-</h2>
            <p className="mt-2 text-xl font-bold">-</p>
          </div>
        </section>

        {/* Management Menu */}
        {/* <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Manage Your Store</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/store/products"
              className="inline-block cursor-pointer rounded bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              Manage Products
            </Link>
            <Link
              href="/store/orders"
              className="inline-block cursor-pointer rounded bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              Orders
            </Link>
            <Link
              href="/store/settings/info"
              className="inline-block cursor-pointer rounded bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              Store Info
            </Link>
            <Link
              href="/store/reports"
              className="inline-block cursor-pointer rounded bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
            >
              Reports
            </Link>
          </div>
        </section> */}

        {/* Notifications */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Notifications</h2>
          <p>No new notifications</p>
        </section>
      </div>
    </div>
    // </DashboardShell>
  );
}
