// src/app/store/(withSidebar)/orders/[storeOrderId]/fulfill/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { StoreOrderDetail } from "@/lib/helpers/order/seller/store-order-detail";
import { attrsToText } from "@/lib/helpers/productList";
import { badgeClassByStatus, humanQty } from "@/lib/untils/store/store-fulfill";
import PACKEDModal, {
  PackPayload,
} from "@/components/store/orders/fulfill/PACKED";
import SHIPPEDModal, {
  ShipPayload,
} from "@/components/store/orders/fulfill/SHIPPED";

export default function FulfillPage(): React.ReactElement {
  const { storeOrderId } = useParams<{ storeOrderId: string }>();

  // state หลัก
  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<StoreOrderDetail | null>(null);
  console.log(order, "order");

  // modal state
  const [openPack, setOpenPack] = React.useState(false);
  const [openShip, setOpenShip] = React.useState(false);

  const api = process.env.NEXT_PUBLIC_API_URL!;

  async function refresh() {
    const res = await fetch(`${api}/store/orders/${storeOrderId}`, {
      credentials: "include",
    });
    if (res.ok) setOrder(await res.json());
  }

  async function onPackSubmit(payload: PackPayload) {
    console.log(payload, "payload");

    try {
      const res = await fetch(
        `${api}/store/orders/${storeOrderId}/fulfill/pack`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success("Packed successfully");
      setOpenPack(false);
      await refresh();
    } catch (e) {
      toast.error((e as Error).message || "Pack failed");
    }
  }

  async function onShipSubmit(payload: ShipPayload) {
    try {
      const res = await fetch(
        `${api}/store/orders/${storeOrderId}/fulfill/ship`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success("Shipment created");
      setOpenShip(false);
      await refresh();
    } catch (e) {
      toast.error((e as Error).message || "Ship failed");
    }
  }

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${api}/store/orders/${storeOrderId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as StoreOrderDetail;
        setOrder(data);
      } catch (err) {
        toast.error((err as Error).message || "Load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [api, storeOrderId]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!order) return <div className="p-4 text-red-500">Order not found</div>;
  const pkgs = order.fulfillment?.packages ?? [];
  const ships = order.fulfillment?.shipments ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Fulfill Order #{order.storeOrderId}
          </h1>
          <div className="mt-2 text-sm text-gray-300">
            Buyer: {order.buyer?.username || "-"}{" "}
            <span className="text-gray-500">({order.buyer?.email || "-"})</span>
            <br />
            Buyer Status:{" "}
            <span
              className={`px-1 py-0.5 text-xs rounded ${badgeClassByStatus(
                order.buyerStatus
              )}`}
            >
              {order.buyerStatus}
            </span>
            {"  "} | Created: {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded bg-indigo-600 text-white cursor-pointer"
            onClick={() => setOpenPack(true)}
          >
            + Pack new package
          </button>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white cursor-pointer"
            onClick={() => setOpenShip(true)}
          >
            + Create shipment
          </button>
        </div>
      </header>

      {/* Items table */}
      <section className="rounded border border-gray-700 overflow-hidden">
        <div className="bg-gray-800 text-white px-4 py-2 font-medium">
          Items
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-100">
            <tr>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-center">Ordered</th>
              <th className="p-2 text-center">Packed</th>
              <th className="p-2 text-center">Shipped</th>
              <th className="p-2 text-center">Delivered</th>
              <th className="p-2 text-center">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {order.itemsPreview.map((it) => {
              const q = humanQty(it);
              return (
                <tr key={it.skuId} className="border-t border-gray-700">
                  <td className="p-2">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-gray-400 text-xs">
                      {attrsToText(it.attributes)}
                    </div>
                  </td>
                  <td className="p-2 text-center">{q.total}</td>
                  <td className="p-2 text-center">{q.packed}</td>
                  <td className="p-2 text-center">{q.shipped}</td>
                  <td className="p-2 text-center">{q.delivered}</td>
                  <td className="p-2 text-center">{q.outstanding}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Packages */}
      <section className="rounded border border-gray-700 overflow-hidden">
        <div className="bg-gray-800 text-white px-4 py-2 font-medium">
          Packages
        </div>
        {!pkgs.length ? (
          <div className="p-4 text-gray-400 text-sm">ยังไม่มีกล่อง</div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {pkgs.map((p) => (
              <li
                key={p._id}
                className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <div>
                  <div className="font-semibold text-white">
                    {p.code || p._id.slice(-6)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Created: {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  <div>Box: {p.boxType || "-"}</div>
                  <div>
                    Weight: {p.weightKg ? `${p.weightKg} kg` : "-"} | Size:{" "}
                    {p.dimension?.l ?? "-"}×{p.dimension?.w ?? "-"}×
                    {p.dimension?.h ?? "-"} cm
                  </div>
                  {p.note ? (
                    <div className="text-gray-400 text-xs mt-1">
                      Note: {p.note}
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-gray-300">
                  <div className="font-medium">Items:</div>
                  <ul className="list-disc ml-4">
                    {p.items.map((x, i) => (
                      <li key={`${p._id}-${x.skuId}-${i}`}>
                        <div className="flex">
                          <div>
                            <div className="font-medium">{x.productName}</div>
                            <div className="text-gray-400 text-xs">
                              {attrsToText(x.attributes)}
                            </div>
                          </div>
                          <div>: x{x.qty}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Shipments */}
      <section className="rounded border border-gray-700 overflow-hidden">
        <div className="bg-gray-800 text-white px-4 py-2 font-medium">
          Shipments
        </div>
        {!ships.length ? (
          <div className="p-4 text-gray-400 text-sm">ยังไม่มี shipment</div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {ships.map((s) => (
              <li
                key={s._id}
                className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <div>
                  <div className="font-semibold text-white">
                    {s.carrier} — {s.trackingNumber}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Shipped:{" "}
                    {s.shippedAt ? new Date(s.shippedAt).toLocaleString() : "-"}
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  Method: {s.method || "-"}
                  {s.note ? (
                    <div className="text-gray-400 text-xs mt-1">
                      Note: {s.note}
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-gray-300">
                  <div className="font-medium">Packages:</div>
                  <div className="text-xs text-gray-400 break-words">
                    {s.packageIds.join(", ")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* โมดัล */}
      <PACKEDModal
        open={openPack}
        items={order?.itemsPreview ?? []}
        onClose={() => setOpenPack(false)}
        onSubmit={onPackSubmit}
      />

      <SHIPPEDModal
        open={openShip}
        packages={order?.fulfillment?.packages ?? []}
        onClose={() => setOpenShip(false)}
        onSubmit={onShipSubmit}
      />
    </div>
  );
}
