// app/store/(withSidebar)/layout.tsx
import StoreFrame from "@/components/store/StoreFrame";
import { cookies } from "next/headers";

async function fetchStoreName(token: string | undefined) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/store/getStoreSecure`,
    {
      headers: token ? { Cookie: `token=${token}` } : {},
      cache: "no-store",
    }
  );
  if (res.ok) {
    const data = await res.json();
    console.log(data, "data");

    return data ?? undefined;
  }
  return undefined;
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;
  const result = await fetchStoreName(token);
  const storeName: string | undefined = result.name || undefined;
  const logoUrl: string | undefined = result.logoUrl || undefined;

  return <StoreFrame storeName={storeName} logoUrl={logoUrl}>{children}</StoreFrame>;
}
