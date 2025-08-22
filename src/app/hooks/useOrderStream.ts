// app/hooks/useOrderStream.ts
"use client";

import * as React from "react";

type OrderStatus =
    | "awaiting_payment"
    | "paying"
    | "paid"
    | "failed"
    | "canceled"
    | "checking"; // สถานะระหว่างโหลดครั้งแรก

type OrderInfo = {
    orderId: string;
    status: OrderStatus;
    paidAt?: string;
    paidAmount?: number;
    paidCurrency?: string;
    paymentIntentId?: string;
    chargeId?: string;
    failureReason?: string;
};

const FINAL = new Set<OrderStatus>(["paid", "failed", "canceled"]);

export function useOrderStream(orderId: string) {
    const [status, setStatus] = React.useState<OrderStatus>("checking");
    const [info, setInfo] = React.useState<OrderInfo | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    const fetchOrder = React.useCallback(async () => {
        const res = await fetch(`${apiBase}/orders/${orderId}`, {
            credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as {
            orderId: string;
            status: OrderStatus;
            paidAt?: string;
            paidAmount?: number;
            paidCurrency?: string;
            payment?: { intentId?: string; chargeId?: string };
            failureReason?: string;
        };

        setStatus(data.status);
        setInfo({
            orderId: data.orderId,
            status: data.status,
            paidAt: data.paidAt,
            paidAmount: data.paidAmount,
            paidCurrency: data.paidCurrency,
            paymentIntentId: data.payment?.intentId,
            chargeId: data.payment?.chargeId,
            failureReason: data.failureReason,
        });

        return data.status;
    }, [apiBase, orderId]);

    React.useEffect(() => {
        if (!orderId) return;
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
                        `${apiBase}/orders/${encodeURIComponent(orderId)}/stream`,
                        { withCredentials: true }
                    );

                    es.onmessage = (ev) => {
                        try {
                            // เซิร์ฟเวอร์ส่งผ่าน Nest @Sse => ev.data จะเป็น JSON string
                            const parsed = JSON.parse(ev.data);

                            // รองรับทั้งรูปแบบ { type, data } หรือ object ตรง ๆ
                            const payload = parsed?.data ?? parsed;

                            if (payload?.status) {
                                setStatus(payload.status);
                                setInfo((prev) => ({
                                    ...(prev ?? { orderId }),
                                    ...payload,
                                }));
                                if (FINAL.has(payload.status)) {
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
    }, [orderId, apiBase, fetchOrder]);

    return { status, info, error };
}
