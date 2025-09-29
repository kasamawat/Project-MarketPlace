// components/Navbar/Navbar.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import NavbarClient from "./Navbar";
import { JwtPayload } from "@/models/JwtPayload";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function preloadNotifications() {
  const cookie = (await cookies()).toString();
  const [listRes, countRes] = await Promise.all([
    fetch(`${API}/user/notifications?status=UNREAD&limit=12`, {
      headers: { cookie },
      cache: "no-store",
    }),
    fetch(`${API}/user/notifications/counts`, {
      headers: { cookie },
      cache: "no-store",
    }),
  ]);

  const { items = [] } = listRes.ok ? await listRes.json() : { items: [] };
  const counts = countRes.ok ? await countRes.json() : { unread: 0, total: 0 };

  return { initialItems: items, initialUnread: counts.unread };
}

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const { initialItems, initialUnread } = await preloadNotifications();

  let user: JwtPayload | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      user = decoded;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  return <NavbarClient user={user} initialItems={initialItems} initialUnread={initialUnread} />;
}
