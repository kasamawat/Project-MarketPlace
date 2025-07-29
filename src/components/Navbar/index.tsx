// components/Navbar/Navbar.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import NavbarClient from "./Navbar";
import { JwtPayload } from "@/models/JwtPayload";

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let user: JwtPayload | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      user = decoded;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  return <NavbarClient user={user} />;
}
