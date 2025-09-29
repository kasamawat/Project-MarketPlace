// hooks/useNotificationsStream.ts
import { useEffect, useRef } from "react";

export function useNotificationsStream(onEvent: (e: unknown) => void) {
  const ref = useRef<EventSource | null>(null);
  useEffect(() => {
    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/realtime/notifications/stream`,
      { withCredentials: true },
    );
    ref.current = es;

    es.onmessage = (ev) => {
      try { onEvent(JSON.parse(ev.data)); } catch {}
    };
    es.onerror = () => { /* ปล่อยให้ browser reconnect อัตโนมัติ */ };

    return () => { es.close(); ref.current = null; };
  }, [onEvent]);
}
