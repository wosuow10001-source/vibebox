// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 로그인 관련 페이지/API는 보호 안 함
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    console.log(`✅ Skip protection for: ${pathname}`);
    return NextResponse.next();
  }

  const devMode = process.env.DEV_LOGIN === "true";

  console.log(`🔍 Middleware check for: ${pathname} (devMode=${devMode})`);

  // In DEV mode, skip all auth checks
  if (devMode) {
    console.log(`✅ DEV mode: bypassing auth for ${pathname}`);
    return NextResponse.next();
  }

  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  console.log(`📦 Cookies available:`, req.cookies.getAll());
  console.log(`🎟️ Token found:`, token ? `yes (${token.substring(0, 20)}...)` : "no");

  if (!token) {
    console.warn(`⚠️ No token found for: ${pathname}`);
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "토큰 없음 - 로그인 필요" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  let payload;

  try {
    payload = await verifyToken(token);
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "토큰 검증 실패" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (!payload) {
    console.warn(`⚠️ Token verification failed for: ${pathname}`);
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "토큰 검증 실패" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  console.log(
    `✅ Access granted: ${pathname}${payload ? ` (user: ${payload.userId})` : " (dev mode)"}`
  );
  return NextResponse.next();
}
