// src/lib/apiClient.ts

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestParams<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  data?: TBody; // สำหรับ body (POST, PUT)
  headers?: HeadersInit;
}

export async function apiClient<T, TBody = unknown>({
  url,
  method = "GET",
  data,
  headers = { "Content-Type": "application/json" },
}: ApiRequestParams<TBody>): Promise<T> {
  const options: RequestInit = {
    method,
    headers,
  };

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "API request failed");
  }

  return res.json();
}
