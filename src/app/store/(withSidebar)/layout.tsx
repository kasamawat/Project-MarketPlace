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

    return data?.name ?? undefined;
  }
  return undefined;
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;
  let storeName: string | undefined = undefined;

  storeName = await fetchStoreName(token);

  return <StoreFrame storeName={storeName}>{children}</StoreFrame>;
}
