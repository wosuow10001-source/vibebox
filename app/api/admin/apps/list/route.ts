// app/api/admin/apps/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 토큰 디코딩 헬퍼
function decodeToken(token: string) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded;
  } catch {
    return null;
  }
}

// ✅ 앱 목록 조회: GET /api/admin/apps/list
export async function GET(req: NextRequest) {
  try {
    // 1️⃣ 관리자 인증 확인
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = decodeToken(token);
    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }

    // 2️⃣ 앱 목록 조회
    const apps = await prisma.app.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        publicPath: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(apps);
  } catch (error: any) {
    console.error("❌ List apps error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch apps" },
      { status: 500 }
    );
  }
}
