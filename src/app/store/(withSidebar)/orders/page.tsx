// src/app/store/(withSidebar)/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  customer: string;
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  date: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // TODO: เรียก API จริง
    setOrders([
      {
        id: "ORD001",
        customer: "John Doe",
        total: 1200,
        status: "pending",
        date: "2025-08-10",
      },
      {
        id: "ORD002",
        customer: "Jane Smith",
        total: 3500,
        status: "shipped",
        date: "2025-08-11",
      },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-white">Orders</h1>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800 text-gray-200">
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-700 hover:bg-gray-800/50"
              >
                <td className="px-4 py-2">{order.id}</td>
                <td className="px-4 py-2">{order.customer}</td>
                <td className="px-4 py-2">฿{order.total.toLocaleString()}</td>
                <td className="px-4 py-2 capitalize">{order.status}</td>
                <td className="px-4 py-2">{order.date}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/store/orders/${order.id}`}
                    className="text-sm text-indigo-400 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
