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
  const token = (await cookies()).get("token")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/getStore`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) redirect("/store/register");

  const store: StoreData = await res.json();

  if (store.status !== "approved") redirect("/store/status");

  return (
    // <DashboardShell storeName={store.name}>
    <div className="flex flex-col max-w-full">
      <div className="max-w-6xl rounded border border-gray-700 p-6">
        <h1 className="text-xl font-bold">
          Welcome to {store.name}&apos;s Dashboard
        </h1>
      </div>

      <div className="mt-6 max-w-6xl rounded border border-gray-700 p-6">
        <h1 className="mb-6 text-3xl font-bold">Store Dashboard</h1>

        {/* Overview */}
        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded bg-gray-900 p-4 shadow">
            <h2 className="text-lg font-semibold">Store Status</h2>
            <p className="mt-2 font-semibold text-green-500">Approved</p>
          </div>
          <div className="rounded bg-gray-900 p-4 shadow">
            <h2 className="text-lg font-semibold">{"Today's Sales"}</h2>
            <p className="mt-2 text-xl font-bold">฿12,345</p>
          </div>
          <div className="rounded bg-gray-900 p-4 shadow">
            <h2 className="text-lg font-semibold">Pending Orders</h2>
            <p className="mt-2 text-xl font-bold">5</p>
          </div>
          <div className="rounded bg-gray-900 p-4 shadow">
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="mt-2 text-xl font-bold">20</p>
          </div>
        </section>

        {/* Management Menu */}
        <section className="mb-8">
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
        </section>

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
