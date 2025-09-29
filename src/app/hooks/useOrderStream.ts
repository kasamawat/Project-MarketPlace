// app/hooks/useOrderStream.ts
"use client";

import { useEffect, useRef } from "react";

export type OrderEvent = {
    masterOrderId: string;
    status:
    | "awaiting_payment"
    | "pending_payment"
    | "paying"
    | "paid"
    | "failed"
    | "canceled"
    | "expired";
    paidAt?: string;
    paidAmount?: number;
    paidCurrency?: string;
    paymentIntentId?: string;
    chargeId?: string;
    reason?: string;
    error?: string;
    at?: string;
    // ...เผื่อฟิลด์อื่น ๆ ที่คุณส่งมา
};

export function useOrderStream(
    masterOrderId: string,
    onEvent: (e: OrderEvent) => void
) {
    const ref = useRef<EventSource | null>(null);

    useEffect(() => {
        if (!masterOrderId) return;

        const url = `${process.env.NEXT_PUBLIC_API_URL}/realtime/order-payment/${encodeURIComponent(
            masterOrderId
        )}/stream`;

        const es = new EventSource(url, { withCredentials: true });
        ref.current = es;

        es.onmessage = (ev) => {
            try {
                const parsed = JSON.parse(ev.data);
                // เผื่อกรณี Nest @Sse ส่งรูป { data: ... }
                onEvent((parsed?.data ?? parsed) as OrderEvent);
            } catch {
                // ignore parse error เงียบ ๆ
            }
        };

        es.onerror = () => {
            // ปล่อยให้ browser จัดการ reconnect เอง
        };

        return () => {
            es.close();
            ref.current = null;
        };
    }, [masterOrderId, onEvent]);
}
