"use client";

import { useCart } from "@/app/context/CartContext";
import { attrsToText } from "@/lib/helpers/productList";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useLayoutEffect, useRef, useState } from "react";

type AddressInfo = {
  _id?: string;
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  district?: string;
  subDistrict?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  note?: string;
  isDefault?: boolean;
};

type PayMethod = "online" | "cod";

export default function ClientCheckOut(): React.ReactElement {
  const router = useRouter();
  const { cartItems } = useCart();

  const leftRef = useRef<HTMLDivElement>(null); // ← อ้างอิงฝั่งซ้าย
  const rightHeadRef = useRef<HTMLDivElement>(null); // ← เฉพาะหัวข้อ “Your order”
  const [rightInnerMaxH, setRightInnerMaxH] = useState<number>();

  useLayoutEffect(() => {
    function syncHeights() {
      const L = leftRef.current?.getBoundingClientRect();
      const H = rightHeadRef.current?.getBoundingClientRect();
      if (!L) return;

      // พื้นที่เลื่อน = ความสูงฝั่งซ้าย - ความสูงหัวด้านขวา - มาร์จิ้นเล็กน้อย
      const available = L.height - (H?.height ?? 0) - 24; // 24 = ช่องว่างเผื่อ
      setRightInnerMaxH(Math.max(180, available)); // กันไม่ให้เล็กเกิน
    }

    const roL = new ResizeObserver(syncHeights);
    const roH = new ResizeObserver(syncHeights);
    if (leftRef.current) roL.observe(leftRef.current);
    if (rightHeadRef.current) roH.observe(rightHeadRef.current);
    window.addEventListener("resize", syncHeights);
    syncHeights();

    return () => {
      roL.disconnect();
      roH.disconnect();
      window.removeEventListener("resize", syncHeights);
    };
  }, []);

  console.log(cartItems, "cartItems");
  const groupItems = Object.groupBy(cartItems, (item) =>
    String(item?.store?.id)
  );

  const groupStore = cartItems
    .map((x) => {
      return x.store;
    })
    .filter(
      (store, idx, self) =>
        idx === self.findIndex((p) => String(p?.id) === String(store?.id))
    )
    .map((x) => {
      return {
        ...x,
        item: groupItems[String(x?.id)],
      };
    });

  const [method, setMethod] = React.useState<PayMethod>("online");

  // ที่อยู่ทั้งหมดของ user + id ที่ถูกเลือก
  const [addresses, setAddresses] = React.useState<AddressInfo[]>([]);
  const [selectedAddrId, setSelectedAddrId] = React.useState<
    string | undefined
  >(undefined);
  const [addrLoading, setAddrLoading] = React.useState<boolean>(true);
  const [addrError, setAddrError] = React.useState<string | null>(null);

  // ฟอร์ม shipping (prefill จาก address ที่เลือก)
  const [shipping, setShipping] = React.useState<AddressInfo>({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    district: "",
    subDistrict: "",
    province: "",
    postalCode: "",
    country: "TH",
    note: "",
  });

  // โหลด addresses
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setAddrLoading(true);
        setAddrError(null);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/addresses`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AddressInfo[];

        if (!alive) return;
        setAddresses(data ?? []);

        // เลือก default → ถ้าไม่มี default เลือกตัวแรก
        const def = (data ?? []).find((a) => a.isDefault) ?? (data ?? [])[0];
        if (def?._id) {
          setSelectedAddrId(def._id);
          setShipping({
            name: def.name ?? "",
            phone: def.phone ?? "",
            line1: def.line1 ?? "",
            line2: def.line2 ?? "",
            district: def.district ?? "",
            subDistrict: def.subDistrict ?? "",
            province: def.province ?? "",
            postalCode: def.postalCode ?? "",
            country: def.country ?? "TH",
            note: def.note ?? "",
          });
        }
      } catch (e) {
        if (alive)
          setAddrError((e as Error)?.message ?? "Failed to load addresses");
      } finally {
        if (alive) setAddrLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // เมื่อเปลี่ยน address ที่เลือก → prefill ฟอร์ม
  React.useEffect(() => {
    if (!selectedAddrId) return;
    const a = addresses.find((x) => x._id === selectedAddrId);
    if (!a) return;
    setShipping({
      name: a.name ?? "",
      phone: a.phone ?? "",
      line1: a.line1 ?? "",
      line2: a.line2 ?? "",
      district: a.district ?? "",
      subDistrict: a.subDistrict ?? "",
      province: a.province ?? "",
      postalCode: a.postalCode ?? "",
      country: a.country ?? "TH",
      note: a.note ?? "",
    });
  }, [selectedAddrId]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = cartItems.reduce(
    (sum, item) => sum + item.sku.price * item.quantity,
    0
  );

  const isFormValid =
    !!shipping.name &&
    !!shipping.phone &&
    !!shipping.line1 &&
    !!shipping.subDistrict &&
    !!shipping.district &&
    !!shipping.province &&
    !!shipping.postalCode &&
    !!shipping.country &&
    total > 0;

  async function createOrderAndGo(method_: PayMethod) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          paymentMethod: method_ === "cod" ? "cod" : "card",
          shippingAddress: shipping,
          // ออปชั่น: ถ้าหลังบ้านอยากรู้ว่ามาจาก addressId ไหน
          // shippingAddressId: selectedAddrId ?? undefined,
        }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    const { masterOrderId } = await res.json();

    if (method_ === "cod") {
      router.push(`/checkout/result/${encodeURIComponent(masterOrderId)}`);
    } else {
      router.push(`/checkout/pay/${encodeURIComponent(masterOrderId)}`);
    }
  }

  return (
    <div className="grid grid-cols-5 gap-6 h-full">
      {/* Left */}
      <div className="col-span-2 mt-5">
        <h1 className="text-xl font-bold">Billing & Shipping</h1>
        <div className="mt-5" ref={leftRef}>
          {/* Address selector */}
          <div className="mt-4 border p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-semibold text-lg">Select Address</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/account/detail/address")}
                  className="text-sm px-3 py-1 rounded border hover:bg-gray-800 cursor-pointer"
                >
                  Manage addresses
                </button>
              </div>
            </div>

            {addrLoading ? (
              <div className="text-sm text-gray-600">Loading addresses…</div>
            ) : addrError ? (
              <div className="text-sm text-red-600">{addrError}</div>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-gray-600">
                You have no saved address. Please add one in{" "}
                <button
                  onClick={() => router.push("/account/detail/address")}
                  className="underline text-blue-600 cursor-pointer"
                >
                  Address Book
                </button>
                .
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                <select
                  className="w-full border p-2 bg-gray-950"
                  value={selectedAddrId ?? ""}
                  onChange={(e) => setSelectedAddrId(e.target.value)}
                >
                  {addresses.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} • {a.phone} • {a.line1}{" "}
                      {a.subDistrict && `• ${a.subDistrict}`}
                      {a.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>

                {/* Preview address ที่เลือกแบบอ่านง่าย */}
                <div className="border rounded p-3 text-sm">
                  <div className="mb-2 font-bold underline">
                    Shipping Detail
                  </div>
                  {selectedAddrId ? (
                    (() => {
                      const a = addresses.find(
                        (x) => x._id === selectedAddrId
                      )!;
                      return (
                        <div className="space-y-1">
                          <div>
                            <span className="font-medium">Full Name:</span>{" "}
                            {a.name || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span>{" "}
                            {a.phone || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Address 1:</span>{" "}
                            {a.line1 || "-"}
                          </div>
                          {a.line2 && (
                            <div>
                              <span className="font-medium">Address 2:</span>{" "}
                              {a.line2}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">
                              Sub-district / District:
                            </span>{" "}
                            {[a.subDistrict, a.district]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </div>
                          <div>
                            <span className="font-medium">
                              Province / Postal:
                            </span>{" "}
                            {[a.province, a.postalCode]
                              .filter(Boolean)
                              .join(" ") || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Country:</span>{" "}
                            {a.country || "-"}
                          </div>
                          {a.note && (
                            <div className="text-gray-600">
                              <span className="font-medium">Note:</span>{" "}
                              {a.note}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-gray-600">Select an address</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 mt-5">
            {/* Payment Method */}
            <div className="border p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "online"}
                    onChange={() => setMethod("online")}
                  />
                  Online (Cards / PromptPay)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={method === "cod"}
                    onChange={() => setMethod("cod")}
                  />
                  COD (เก็บเงินปลายทาง)
                </label>
              </div>

              {method !== "cod" ? (
                <button
                  disabled={!isFormValid}
                  className={`w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 ${
                    isFormValid ? "cursor-pointer hover:bg-blue-700" : ""
                  }`}
                  onClick={() => createOrderAndGo("online")}
                >
                  เริ่มชำระเงิน (ไปหน้าชำระเงิน)
                </button>
              ) : (
                <button
                  className="w-full bg-gray-600 text-white py-2 rounded-lg disabled:opacity-50"
                  disabled={!isFormValid}
                  onClick={() => console.log("TEST")} //createOrderAndGo("cod")
                >
                  ยืนยันสั่งซื้อแบบเก็บเงินปลายทาง
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Order summary */}
      <div className="col-span-3 mt-5">
        {/* หัว (ไม่เลื่อน) */}
        <h1 className="text-xl font-bold">Your order</h1>
        {/* กล่องเลื่อนแกน Y ใต้หัว */}
        <div className="mt-5">
          <div className="space-y-6">
            <div className="border p-4 rounded-lg shadow-sm bg-gray-800">
              <div
                className="overflow-y-auto"
                style={{ maxHeight: rightInnerMaxH }}
              >
                {groupStore.map((store) => (
                  <div key={store.id} className="py-2">
                    <div className="grid grid-cols-5 gap-4 text-center border-b border-t py-3">
                      <div>
                        <h2 className="text-white font-medium text-left pl-3">
                          Store: {store.name}
                        </h2>
                      </div>
                    </div>

                    {store.item?.map((item, index) => (
                      <li
                        key={`${item.productId}::${item.sku.itemId}`}
                        className={`grid grid-cols-5 ${
                          cartItems.length === index + 1
                            ? "border-b-1 pb-4"
                            : ""
                        } pt-2 pb-2 mr-4 ml-4 text-sm`}
                      >
                        <span className="col-span-1 text-center">
                          <Image
                            src={
                              item?.productImage ||
                              item?.cover?.url ||
                              "/no-image.png"
                            }
                            alt={item.productName}
                            width={160}
                            height={224}
                            className="w-[120px] h-[168px] object-cover rounded-md shadow border border-gray-600 mx-auto"
                          />
                        </span>
                        <span className="col-span-1 text-center content-center">
                          {item.productName} {attrsToText(item.sku.attributes)}
                        </span>
                        <span className="col-span-1 text-center content-center">
                          {item.quantity}
                        </span>
                        <span className="col-span-1 text-center content-center">
                          ฿ {item.sku.price}
                        </span>
                        <span className="col-span-1 text-right content-center">
                          ฿ {item.sku.price * item.quantity}
                        </span>
                      </li>
                    ))}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 border-b-1 border-t-1 p-4 mt-4 mb-8 font-bold">
                <span className="col-span-1 text-left">Total</span>
                <span className="col-span-1 text-right text-green-500">
                  ฿ {total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
