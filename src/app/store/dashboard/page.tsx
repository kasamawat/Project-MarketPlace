// app/store/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default async function StoreDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  let payload: unknown = null;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (e) {
    redirect("/auth/login");
  }

  if (!payload?.storeId) {
    redirect("/store/register");
  }

  return <div>Welcome to your store dashboard</div>;
}
