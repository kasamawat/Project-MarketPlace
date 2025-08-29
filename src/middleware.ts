// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { parseJwt } from "./lib/parseJwt";
import { JwtPayload } from "./models/JwtPayload";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname.startsWith("/auth/login");
  const isRegisterPage = pathname.startsWith("/auth/register");
  const isStoreRegisterPage = pathname.startsWith("/store/register");

  // =========================================== Client ===========================================
  // ถ้ามี token แล้ว user เข้า /auth/login หรือ /auth/register → redirect home
  if (token && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ถ้าไม่มี token แล้วเข้า /account/... -> redirect ไป login
  const isAccountPath = pathname.startsWith("/account/");
  console.log(isAccountPath,'isAccountPath');
  
  if(!token && isAccountPath) {
    console.log("PASS");
    
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  //  ถ้าไม่มี token แล้วเข้า /store/... → redirect ไป login
  // (ยกเว้น /store/public หรือ path ที่อนุญาต)
  const isStorePath = pathname.startsWith("/store/");
  if (!token && isStorePath) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ==============================================================================================

  // =========================================== Store ===========================================
  const requireStorePaths = [
    "/store/dashboard",
    "/store/products",
    "/store/settings",
    "/store/status",
    // เพิ่ม path อื่นได้ตามต้องการ
  ];

  // decode JWT เพื่อตรวจสอบ storeId
  let storeId: string | null = null;
  if (token) {
    const payload = parseJwt(token) as JwtPayload;
    storeId = payload?.storeId ?? null;
  }

  // ถ้ายังไม่มี token → redirect login
  if (!token && pathname.startsWith("/store/")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // === [1] ถ้า user ยังไม่มีร้าน แต่เข้าหน้าต้องมีร้านค้า ===
  if (
    token &&
    !storeId &&
    requireStorePaths.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.redirect(new URL("/store/register", req.url));
  }

  // === [2] ถ้า user มีร้านค้าแล้ว แต่ดันเข้า /store/register ซ้ำ ===
  if (
    token &&
    storeId &&
    pathname.startsWith("/store/register")
  ) {
    return NextResponse.redirect(new URL("/store/dashboard", req.url));
  }

  // ==============================================================================================

  // 3. อื่น ๆ ปล่อยผ่าน
  return NextResponse.next();
}

// กำหนดเส้นทางที่ middleware ทำงาน
export const config = {
  matcher: [
    "/auth/login",
    "/auth/register",
    "/account/:path*",
    "/store/:path*",   // ป้องกันทุกหน้าภายใต้ /store/
  ],
};