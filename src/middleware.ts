// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    const isLoginPage = req.nextUrl.pathname.startsWith("/auth/login");
    const isRegisterPage = req.nextUrl.pathname.startsWith("/auth/register");

    // ถ้ามี token และอยู่หน้า login/register → redirect ไปหน้า home
    if (token && (isLoginPage || isRegisterPage)) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const protectedPaths = ["/store/register", "/stores"];
    const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

    if (!token && isProtectedPath) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

// กำหนดเส้นทางที่ middleware ทำงาน
export const config = {
    matcher: [
        "/auth/login",
        "/auth/register",
        "/store/register",
        "/stores/:path*/dashboard", // path ป้องกันเฉพาะ dashboard
    ],
};
