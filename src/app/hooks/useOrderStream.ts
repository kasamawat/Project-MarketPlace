// app/hooks/useOrderStream.ts
"use client";

import { BuyerOrderDetail } from "@/lib/helpers/orderDetail";
import * as React from "react";

type OrderStatus =
    | "pending_payment"
    | "paying"
    | "processing"
    | "paid"
    | "shipped" // << เพิ่ม
    | "delivered" // << เพิ่ม
    | "expired"
    | "canceled";

const FINAL = new Set<OrderStatus>(["paid", "canceled", "expired"]);

export function useOrderStream(masterOrderId: string) {
    const [userStatus, setUserStatus] = React.useState<OrderStatus>("pending_payment");
    const [info, setInfo] = React.useState<BuyerOrderDetail | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    const fetchOrder = React.useCallback(async () => {
        const res = await fetch(`${apiBase}/orders/${masterOrderId}/result`, {
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data: BuyerOrderDetail = (await res.json());
        console.log(data,'data');
        
        setUserStatus(data.userStatus);
        setInfo({
            masterOrderId: data.masterOrderId,
            userStatus: data.userStatus,
            createdAt: data.createdAt,
            currency: data.currency,
            payment: data.payment,
            paidAt: data.paidAt,
            paidAmount: data.paidAmount,
            paidCurrency: data.paidCurrency,
            paymentIntentId: data.payment?.intentId,
            stores: data.stores,
        });

        return data.userStatus;
    }, [apiBase, masterOrderId]);

    React.useEffect(() => {
        if (!masterOrderId) return;
        let es: EventSource | null = null;
        let pollTimer: ReturnType<typeof setInterval> | null = null;
        let cancelled = false;

        (async () => {
            try {
                const cur = await fetchOrder();
                if (cancelled) return;

                if (!FINAL.has(cur)) {
                    // เปิด SSE
                    es = new EventSource(
                        `${apiBase}/orders/${encodeURIComponent(masterOrderId)}/stream`,
                        { withCredentials: true }
                    );

                    es.onmessage = (ev) => {
                        try {
                            // เซิร์ฟเวอร์ส่งผ่าน Nest @Sse => ev.data จะเป็น JSON string
                            const parsed = JSON.parse(ev.data);

                            // รองรับทั้งรูปแบบ { type, data } หรือ object ตรง ๆ
                            const payload = parsed?.data ?? parsed;

                            const s = typeof payload === "string" ? payload : payload?.status;

                            if (s) {
                                setUserStatus(s);
                                setInfo((prev) => ({
                                    ...(prev ?? { masterOrderId }),
                                    ...payload,
                                }));
                                if (FINAL.has(s)) {
                                    es?.close();
                                    if (pollTimer) clearInterval(pollTimer);
                                }
                            }
                        } catch {
                            // เงียบ ๆ ถ้า parse ไม่ได้
                        }
                    };

                    es.onerror = () => {
                        // ถ้า SSE หลุด ให้ fallback ด้วย polling ทุก 3 วิ
                        if (!pollTimer) {
                            pollTimer = setInterval(async () => {
                                try {
                                    const s = await fetchOrder();
                                    if (FINAL.has(s)) {
                                        if (pollTimer) clearInterval(pollTimer);
                                    }
                                } catch {
                                    // เงียบ ๆ
                                }
                            }, 3000);
                        }
                    };
                }
            } catch (e) {
                setError((e as Error)?.message || "โหลดคำสั่งซื้อไม่สำเร็จ");
            }
        })();

        return () => {
            cancelled = true;
            es?.close();
            if (pollTimer) clearInterval(pollTimer);
        };
    }, [masterOrderId, apiBase, fetchOrder]);

    return { userStatus, info, error };
}
